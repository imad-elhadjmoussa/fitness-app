const WorkoutLog = require("../models/WorkoutLog");
const User = require("../models/User");
const mongoose = require("mongoose");
const { findMultiCityPairs } = require("../utils/multiCity");

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

        // Athletes may only log workouts for themselves
        if (
            req.user &&
            req.user.role === "athlete" &&
            req.user._id.toString() !== String(userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Athletes can only create workouts for themselves"
            });
        }

        // Create workout document (strict:false allows extra fields like city/calories)
        const workout = new WorkoutLog({
            userId,
            workoutType,
            duration,
            ...(date !== undefined && { date }),
            ...(gpsRoute !== undefined && { gpsRoute }),
            ...(heartRate !== undefined && { heartRate }),
            ...(photos !== undefined && { photos }),
            ...(deviceInfo !== undefined && { deviceInfo }),
            ...(req.body.city !== undefined && { city: req.body.city }),
            ...(req.body.calories !== undefined && { calories: req.body.calories })
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

// GET /api/workouts/public/multi-city
exports.getPublicMultiCity = async (_req, res) => {
    try {
        const workouts = await WorkoutLog.aggregate([
            {
                $match: {
                    city: { $type: "string", $ne: "" }
                }
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: "userId",
                    foreignField: "_id",
                    as: "athlete"
                }
            },
            { $unwind: "$athlete" },
            { $match: { "athlete.role": "athlete" } },
            {
                $project: {
                    userId: 1,
                    city: 1,
                    date: 1
                }
            },
            { $sort: { userId: 1, date: 1, _id: 1 } }
        ]);
        const data = findMultiCityPairs(workouts);

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving multi-city workout pairs",
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

        if (
            req.user &&
            req.user.role === "athlete" &&
            req.user._id.toString() !== String(userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Athletes can only view their own workouts"
            });
        }

        // Retrieve last 20 workouts
        const workouts = await WorkoutLog.find({
            userId: new mongoose.Types.ObjectId(userId)
        })
            .sort({ date: -1, _id: -1 })
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

// Public read-only summary for coach/admin dashboards. Precise routes,
// heart-rate samples, and photo URLs are intentionally excluded.
exports.getPublicRecentWorkouts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const athlete = await User.findOne({
            _id: userId,
            role: "athlete"
        }).select("_id").lean();

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        const workouts = await WorkoutLog.find({
            userId: new mongoose.Types.ObjectId(userId)
        })
            .select("userId workoutType date duration city calories deviceInfo.device deviceInfo.model gpsRoute.distance gpsRoute.unit heartRate.average heartRate.maximum photos")
            .sort({ date: -1, _id: -1 })
            .limit(20)
            .lean();

        const data = workouts.map((workout) => {
            const { photos, ...summary } = workout;
            return {
                ...summary,
                photoCount: Array.isArray(photos) ? photos.length : photos ? 1 : 0
            };
        });

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving workout activities",
            error: error.message
        });
    }
};