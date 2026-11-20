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