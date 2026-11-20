const WorkoutLog = require("../models/WorkoutLog");
const mongoose = require("mongoose");


// POST: Insert a new workout log
exports.createWorkout = async (req, res) => {
    try {
        const {
            userId,
            workoutType,
            duration,
            date,
            gpsRoute,
            heartRate,
            photos,
            deviceInfo
        } = req.body;

        // Basic validation
        if (!userId || !workoutType || duration === undefined) {
            return res.status(400).json({
                success: false,
                message: "userId, workoutType and duration are required"
            });
        }

        if (typeof duration !== "number" || duration <= 0) {
            return res.status(400).json({
                success: false,
                message: "Duration must be a positive number"
            });
        }

            // Create workout document
        const workout = new WorkoutLog({
            userId,
            workoutType,
            duration,
            ...(date !== undefined && { date }),
            ...(gpsRoute !== undefined && { gpsRoute }),
            ...(heartRate !== undefined && { heartRate }),
            ...(photos !== undefined && { photos }),
            ...(deviceInfo !== undefined && { deviceInfo })
        });

        if (req.body.location !== undefined) {
            workout.location = req.body.location;
        }


        // Save to MongoDB
        const savedWorkout = await workout.save();

        return res.status(201).json({
            success: true,
            message: "Workout created successfully",
            data: savedWorkout
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating workout",
            error: error.message
        });
    }
};

// ======================================
// GET LAST 20 ACTIVITIES FOR A USER
// GET /api/workouts/user/:userId/recent
// ======================================

exports.getRecentWorkouts = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Retrieve last 20 workouts
        const workouts = await WorkoutLog.find({
            userId: new mongoose.Types.ObjectId(userId)
        })
            .sort({ date: -1 })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            count: workouts.length,
            data: workouts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving workout activities",
            error: error.message
        });
    }
};

// ======================================
// GET USERS WITH WORKOUTS IN DIFFERENT CITIES
// GET /api/workouts/users-with-city-changes
// ======================================

exports.getUsersWithWorkoutsInDifferentCities = async (req, res) => {
    try {
        const results = await WorkoutLog.aggregate([
            // 1. Select workouts containing a valid city and date
            {
                $match: {
                    userId: { $exists: true },
                    date: { $type: "date" },
                    "location.city": {
                        $type: "string",
                        $ne: ""
                    }
                }
            },

            // 2. Find later workouts belonging to the same user
            {
                $lookup: {
                    from: WorkoutLog.collection.name,

                    let: {
                        currentUserId: "$userId",
                        currentDate: "$date",
                        currentCity: "$location.city"
                    },

                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", "$$currentUserId"] },

                                        // The second workout must be later
                                        { $gt: ["$date", "$$currentDate"] },

                                        // Difference must be at most 24 hours
                                        {
                                            $lte: [
                                                { $subtract: ["$date", "$$currentDate"] },
                                                24 * 60 * 60 * 1000
                                            ]
                                        },

                                        // Cities must be different
                                        { $ne: ["$location.city", "$$currentCity"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                workoutType: 1,
                                date: 1,
                                "location.city": 1
                            }
                        }
                    ],

                    as: "matchingWorkouts"
                }
            },

            // 3. Keep only workouts that have a matching workout
            {
                $unwind: "$matchingWorkouts"
            },

            // 4. Format each matching pair
            {
                $project: {
                    _id: 0,
                    userId: 1,

                    pair: {
                        firstWorkout: {
                            id: "$_id",
                            workoutType: "$workoutType",
                            date: "$date",
                            city: "$location.city"
                        },

                        secondWorkout: {
                            id: "$matchingWorkouts._id",
                            workoutType: "$matchingWorkouts.workoutType",
                            date: "$matchingWorkouts.date",
                            city: "$matchingWorkouts.location.city"
                        }
                    }
                }
            },

            // 5. Group matching pairs by user
            {
                $group: {
                    _id: "$userId",
                    matchingPairs: {
                        $push: "$pair"
                    }
                }
            },

            // 6. Format the final response
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    pairCount: { $size: "$matchingPairs" },
                    matchingPairs: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("Error finding users:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to find users with workouts in different cities",
            error: error.message
        });
    }
};