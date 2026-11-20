# FitPulse API – Frontend Developer Guide

This document describes the FitPulse backend endpoints currently implemented and how the frontend can use them.

## 1. Project overview

FitPulse is a fitness-tracking platform. Users can:

- Create an account with basic profile information.
- View their profile.
- Update fitness goals, weight, and contact information.
- Record workouts with different optional data structures.
- Retrieve their 20 most recent workouts.

Workout documents are intentionally flexible. Depending on the activity and device, a workout may contain GPS data, heart-rate measurements, photos, device information, or only basic fields such as workout type and duration.

## 2. Base URL and request conventions

For local development:

```text
http://localhost:3000
```

All endpoints use the `/api` prefix.

- Send JSON request bodies with `Content-Type: application/json`.
- IDs in URL examples are placeholders. Replace them with real MongoDB user IDs returned by the create-user endpoint.
- Dates should be sent as ISO 8601 strings, preferably in UTC, for example: `2026-11-19T08:30:00.000Z`.
- Successful responses use a JSON object containing `success`, and usually `message` and/or `data`.
- Error responses contain `success: false` and a `message`.

> **Auth (added):** send `Authorization: Bearer <token>` on protected routes.
> Tokens are issued by `POST /api/auth/login` and by `POST /api/users` (register now returns `{ token, user }`).
> Use `GET /api/auth/me` to restore a session. Athletes may only mutate their own profile/workouts.

## 3. Endpoint summary

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Login → `{ token, user }` |
| `GET` | `/api/auth/me` | Current user (Bearer token) |
| `POST` | `/api/users` | Register → `{ token, user }` |
| `GET` | `/api/users` | List users (auth) |
| `GET` | `/api/users/:userId` | Retrieve a user's profile (auth) |
| `PATCH` | `/api/users/:userId/profile` | Partially update a user's profile (auth) |
| `POST` | `/api/workouts` | Create a workout log (auth) |
| `GET` | `/api/workouts/user/:userId/recent` | Retrieve the latest 20 workout logs for a user (auth) |

---

## 4. User APIs

### 4.1 Create a user

**Request**

```http
POST /api/users
Content-Type: application/json
```

**Example body**

```json
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "email": "alex@example.com",
  "password": "SecurePassword123",
  "profile": {
    "fitnessGoal": "muscle_gain",
    "weight": 75,
    "contact": {
      "phone": "+213555123456",
      "address": "Constantine, Algeria"
    }
  }
}
```

**Fields**

| Field | Type | Required | Notes |
|---|---|---:|---|
| `firstName` | string | Yes | User's first name |
| `lastName` | string | Yes | User's last name |
| `email` | string | Yes | Must be unique |
| `password` | string | Yes | Hashed by the backend before storage |
| `profile.fitnessGoal` | string | No | See supported values below |
| `profile.weight` | number | No | User's weight |
| `profile.contact.phone` | string | No | Phone number |
| `profile.contact.address` | string | No | Contact address |

Supported `fitnessGoal` values:

- `weight_loss`
- `muscle_gain`
- `maintenance`
- `endurance`
- `general_fitness`

**Example success response – `201 Created`**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "673a12345678901234567890",
    "firstName": "Alex",
    "lastName": "Morgan",
    "email": "alex@example.com",
    "profile": {
      "fitnessGoal": "muscle_gain",
      "weight": 75,
      "contact": {
        "phone": "+213555123456",
        "address": "Constantine, Algeria"
      }
    }
  }
}
```

The password is not included in the response.

**Possible errors**

- `400 Bad Request` – a required field is missing or validation fails.
- `409 Conflict` – the email address is already registered.
- `500 Internal Server Error` – unexpected server error.

### 4.2 Get user profile

**Request**

```http
GET /api/users/:userId
```

**Example**

```http
GET /api/users/673a12345678901234567890
```

No request body is required.

**Example success response – `200 OK`**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "673a12345678901234567890",
    "firstName": "Alex",
    "lastName": "Morgan",
    "email": "alex@example.com",
    "profile": {
      "fitnessGoal": "muscle_gain",
      "weight": 75,
      "contact": {
        "phone": "+213555123456",
        "address": "Constantine, Algeria"
      }
    },
    "createdAt": "2026-11-19T10:00:00.000Z",
    "updatedAt": "2026-11-19T10:00:00.000Z"
  }
}
```

The password is excluded from the response.

**Possible errors**

- `400 Bad Request` – invalid MongoDB user ID.
- `404 Not Found` – no user exists with that ID.
- `500 Internal Server Error` – unexpected server error.

### 4.3 Update user profile

**Request**

```http
PATCH /api/users/:userId/profile
Content-Type: application/json
```

PATCH is used because the frontend can send only the fields that changed. Omitted fields are preserved.

**Example A – update weight only**

```json
{
  "weight": 72
}
```

**Example B – update fitness goal**

```json
{
  "fitnessGoal": "endurance"
}
```

**Example C – update only the phone number**

```json
{
  "contact": {
    "phone": "+213555999999"
  }
}
```

**Example D – update several profile fields**

```json
{
  "fitnessGoal": "weight_loss",
  "weight": 70,
  "contact": {
    "phone": "+213555777777",
    "address": "Algiers, Algeria"
  }
}
```

**Example success response – `200 OK`**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "673a12345678901234567890",
    "firstName": "Alex",
    "lastName": "Morgan",
    "email": "alex@example.com",
    "profile": {
      "fitnessGoal": "weight_loss",
      "weight": 70,
      "contact": {
        "phone": "+213555777777",
        "address": "Algiers, Algeria"
      }
    }
  }
}
```

**Possible errors**

- `400 Bad Request` – invalid user ID, no valid fields supplied, or invalid contact structure.
- `404 Not Found` – user does not exist.
- `500 Internal Server Error` – unexpected server error.

**Frontend notes**

- Send only changed fields.
- To update a nested contact property, send it inside `contact`.
- Do not send `contact: {}` when no contact field needs updating.
- The backend uses MongoDB `$set` with dotted paths, so updating `contact.phone` does not overwrite `contact.address`.
- The current controller accepts `phone` and `address` as contact keys.

---

## 5. Workout APIs

### 5.1 Create a workout log

**Request**

```http
POST /api/workouts
Content-Type: application/json
```

Required fields:

- `userId`
- `workoutType`
- `duration` (a positive number, in minutes)

Other fields are optional. The same endpoint accepts different workout document structures.

#### Example A – running workout with GPS

```json
{
  "userId": "673a12345678901234567890",
  "workoutType": "running",
  "duration": 45,
  "date": "2026-11-19T08:30:00.000Z",
  "gpsRoute": {
    "startLocation": {
      "latitude": 36.7538,
      "longitude": 3.0588
    },
    "endLocation": {
      "latitude": 36.7600,
      "longitude": 3.0700
    },
    "coordinates": [
      {
        "latitude": 36.7538,
        "longitude": 3.0588,
        "timestamp": "2026-11-19T08:30:00.000Z"
      },
      {
        "latitude": 36.7570,
        "longitude": 3.0640,
        "timestamp": "2026-11-19T08:45:00.000Z"
      }
    ],
    "distance": 5.4,
    "unit": "km"
  },
  "deviceInfo": {
    "device": "Garmin Watch",
    "model": "Forerunner 255"
  }
}
```

#### Example B – simple workout with duration only

```json
{
  "userId": "673a12345678901234567890",
  "workoutType": "weightlifting",
  "duration": 60,
  "date": "2026-11-19T10:00:00.000Z"
}
```

#### Example C – cycling workout with photos and heart-rate data

```json
{
  "userId": "673a12345678901234567890",
  "workoutType": "cycling",
  "duration": 90,
  "date": "2026-11-19T15:00:00.000Z",
  "photos": [
    {
      "url": "https://example.com/photos/workout1.jpg",
      "caption": "Cycling session"
    },
    {
      "url": "https://example.com/photos/workout2.jpg",
      "caption": "After workout"
    }
  ],
  "heartRate": {
    "average": 135,
    "maximum": 178,
    "measurements": [
      {
        "time": "15:00",
        "bpm": 110
      },
      {
        "time": "15:15",
        "bpm": 135
      },
      {
        "time": "15:30",
        "bpm": 155
      }
    ]
  },
  "deviceInfo": {
    "device": "Apple Watch",
    "model": "Series 10"
  }
}
```

**Example success response – `201 Created`**

```json
{
  "success": true,
  "message": "Workout created successfully",
  "data": {
    "_id": "674a12345678901234567890",
    "userId": "673a12345678901234567890",
    "workoutType": "running",
    "duration": 45,
    "date": "2026-11-19T08:30:00.000Z",
    "createdAt": "2026-11-19T08:31:00.000Z",
    "updatedAt": "2026-11-19T08:31:00.000Z"
  }
}
```

The response's `data` contains the saved document and all fields supplied in the request. The example above is abbreviated.

**Possible errors**

- `400 Bad Request` – missing required fields or duration is not a positive number.
- `500 Internal Server Error` – unexpected server error.

**Important implementation note**

The current workout model uses flexible fields for GPS, heart-rate, photos, and device information, and has `strict: false`. This supports varied document shapes. The frontend should still send valid, consistently named data fields.

For photos, send hosted image URLs and metadata rather than raw image files. A separate upload endpoint or storage service is needed to upload image binaries; that upload flow is not included in the current API.

### 5.2 Get the latest 20 workouts for a user

**Request**

```http
GET /api/workouts/user/:userId/recent
```

**Example**

```http
GET /api/workouts/user/673a12345678901234567890/recent
```

No request body is required.

**Example success response – `200 OK`**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "674a11111111111111111111",
      "userId": "673a12345678901234567890",
      "workoutType": "cycling",
      "duration": 90,
      "date": "2026-11-19T15:00:00.000Z",
      "photos": [
        {
          "url": "https://example.com/photos/workout1.jpg"
        }
      ],
      "heartRate": {
        "average": 135,
        "maximum": 178
      }
    },
    {
      "_id": "674a22222222222222222222",
      "userId": "673a12345678901234567890",
      "workoutType": "weightlifting",
      "duration": 60,
      "date": "2026-11-19T10:00:00.000Z"
    },
    {
      "_id": "674a33333333333333333333",
      "userId": "673a12345678901234567890",
      "workoutType": "running",
      "duration": 45,
      "date": "2026-11-18T08:00:00.000Z",
      "gpsRoute": {
        "distance": 5.4,
        "unit": "km",
        "coordinates": [
          {
            "latitude": 36.7538,
            "longitude": 3.0588
          }
        ]
      }
    }
  ]
}
```

**Frontend notes**

- `data` is an array of up to 20 workout documents.
- The array is sorted newest first by `date` (and by `_id` as a tie-breaker if the controller uses the recommended compound sort).
- A workout may or may not contain `gpsRoute`, `heartRate`, `photos`, or `deviceInfo`.
- Check whether an optional field exists before rendering it.
- Do not assume every workout has the same shape.
- `count` is the number of documents returned, not necessarily the user's total number of workouts.

**Possible errors**

- `400 Bad Request` – invalid MongoDB user ID.
- `500 Internal Server Error` – unexpected server error.

---

## 6. Handling flexible workout data in the frontend

Because workout documents have different structures, the frontend should render optional sections conditionally.

Example in React:

```jsx
function WorkoutCard({ workout }) {
  return (
    <article>
      <h3>{workout.workoutType}</h3>

      <p>Duration: {workout.duration} minutes</p>

      {workout.gpsRoute && (
        <section>
          <h4>GPS Route</h4>
          <p>Distance: {workout.gpsRoute.distance} km</p>
        </section>
      )}

      {workout.heartRate && (
        <section>
          <h4>Heart Rate</h4>
          <p>Average: {workout.heartRate.average} BPM</p>
          <p>Maximum: {workout.heartRate.maximum} BPM</p>
        </section>
      )}

      {workout.photos?.length > 0 && (
        <section>
          <h4>Photos</h4>
          {workout.photos.map((photo, index) => (
            <img
              key={photo.url || index}
              src={photo.url}
              alt={photo.caption || "Workout"}
            />
          ))}
        </section>
      )}
    </article>
  );
}
```

The optional chaining operator (`?.`) prevents errors when optional data is missing.

---

## 7. Suggested frontend API service

If the frontend uses React with Axios, create a reusable API client.

**`src/services/api.js`**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
```

**`src/services/userService.js`**

```javascript
import api from "./api";

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, profileData) => {
  const response = await api.patch(
    `/users/${userId}/profile`,
    profileData
  );
  return response.data;
};
```

**`src/services/workoutService.js`**

```javascript
import api from "./api";

export const createWorkout = async (workoutData) => {
  const response = await api.post("/workouts", workoutData);
  return response.data;
};

export const getRecentWorkouts = async (userId) => {
  const response = await api.get(
    `/workouts/user/${userId}/recent`
  );
  return response.data;
};
```

**Example usage**

```javascript
const profile = await getUser(userId);

const updatedProfile = await updateUserProfile(userId, {
  weight: 72
});

const workouts = await getRecentWorkouts(userId);
```

For a frontend using React Query, these service functions can also be wrapped in `useQuery` and `useMutation` hooks.

---

## 8. Error handling

The frontend should handle HTTP errors consistently.

| Status | Meaning | Suggested frontend behavior |
|---|---|---|
| `200` | Request successful | Display returned data |
| `201` | Resource created | Show success and update UI |
| `400` | Invalid request | Show validation feedback |
| `404` | User not found | Show not-found state |
| `409` | Email already registered | Ask user to use another email |
| `500` | Server error | Show a generic error and allow retry |

Example Axios error handling:

```javascript
try {
  const result = await getUser(userId);
  console.log(result.data);
} catch (error) {
  const message =
    error.response?.data?.message ||
    "Something went wrong. Please try again.";

  console.error(message);
}
```

## 9. MongoDB implementation notes

The backend uses these main collections:

### `users`

Stores structured user and profile information:

- First and last name
- Email and hashed password
- Fitness goal
- Weight
- Contact information

### `workoutlogs`

Stores flexible workout documents:

- User reference (`userId`)
- Workout type
- Duration and date
- Optional GPS route
- Optional heart-rate data
- Optional photo metadata
- Optional device information
- Other additional workout fields

The workout collection has a compound index on:

```javascript
{ userId: 1, date: -1 }
```

For consistent ordering when dates match, the recommended index and query sort are:

```javascript
// Index
{ userId: 1, date: -1, _id: -1 }

// Sort
{ date: -1, _id: -1 }
```

## 10. Current scope and items not yet implemented

The endpoints documented above reflect the current backend implementation. The following features are not included yet:

- Login, logout, JWT/session authentication, and authorization.
- User deletion.
- Editing first name, last name, or email.
- Pagination or configurable workout limits.
- Workout deletion or editing.
- Photo binary upload and storage integration.
- Meal logging and body-metric history APIs.
- Coach-specific access and weekly engagement reports.

Do not build frontend flows that depend on these features until their backend endpoints are added.

## 11. Quick integration checklist

- [ ] Configure the frontend base URL.
- [ ] Connect the registration form to `POST /api/users`.
- [ ] Store the returned user `_id` for subsequent API calls (until authentication is implemented).
- [ ] Load the profile with `GET /api/users/:userId`.
- [ ] Save profile changes with `PATCH /api/users/:userId/profile`.
- [ ] Submit workout logs with `POST /api/workouts`.
- [ ] Load recent activities with `GET /api/workouts/user/:userId/recent`.
- [ ] Render optional workout fields conditionally.
- [ ] Handle loading, empty, success, and error states.
- [ ] Remember that authentication and authorization are still pending.

---

**Document:** FitPulse API Integration Guide  
**Audience:** Frontend developer  
**Backend stack:** Node.js, Express, MongoDB, Mongoose
