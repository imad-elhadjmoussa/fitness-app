const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },

        workoutType: {
            type: String,
            required: true
        },

        date: {
            type: Date,
            default: Date.now
        },

        duration: {
            type: Number,
            required: true
        },

        city: {
            type: String,
            trim: true
        },

        // Optional GPS information
        gpsRoute: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },

        // Optional heart-rate information
        heartRate: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },

        // Optional photo attachments
        photos: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        },

        // Additional device-specific or user-specific data
        deviceInfo: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined
        }

    },
    {
        timestamps: true,
        strict: false
    }
);

// Index for retrieving recent workouts per user
workoutLogSchema.index({ userId: 1, date: -1 });

// Covers the multi-city scan while keeping large optional workout fields out of it.
workoutLogSchema.index(
    { userId: 1, date: 1, city: 1 },
    {
        name: "multi_city_user_date_city",
        partialFilterExpression: { city: { $type: "string" } }
    }
);

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);