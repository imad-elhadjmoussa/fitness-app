const WorkoutLog = require("../models/WorkoutLog");
const User = require("../models/User");
const mongoose = require("mongoose");
const { findMultiCityPairs } = require("../utils/multiCity");
const { performance } = require("node:perf_hooks");
const {
    retryMongoWrite,
    isRetryableMongoError
} = require("../utils/retryMongoWrite");

// POST: Insert a new workout log
exports.createWorkout = async (req, res) => {
    const startedAt = performance.now();
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
        let savedWorkout;
        try {
            savedWorkout = await retryMongoWrite(() => workout.save());
        } catch (error) {
            if (error.code !== 11000) throw error;

            // A write may commit before its acknowledgement is lost during an election.
            savedWorkout = await WorkoutLog.findOne({
                _id: workout._id,
                userId: workout.userId
            }).lean();
            if (!savedWorkout) throw error;
        }

        res.set(
            "Server-Timing",
            `workout-write;dur=${(performance.now() - startedAt).toFixed(2)}`
        );
        return res.status(201).json({
            success: true,
            message: "Workout created successfully",
            data: savedWorkout
        });

    } catch (error) {
        res.set(
            "Server-Timing",
            `workout-write;dur=${(performance.now() - startedAt).toFixed(2)}`
        );
        if (isRetryableMongoError(error)) {
            res.set("Retry-After", "1");
            return res.status(503).json({
                success: false,
                message: "Workout storage is temporarily unavailable; retry the request"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error creating workout",
            error: error.message
        });
    }
};

// GET /api/workouts/public/multi-city
exports.getPublicMultiCity = async (_req, res) => {
    const startedAt = performance.now();
    try {
        const workouts = await WorkoutLog.aggregate([
            {
                $match: {
                    city: { $type: "string" }
                }
            },
            { $sort: { userId: 1, date: 1 } },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    city: 1,
                    date: 1
                }
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: "userId",
                    foreignField: "_id",
                    pipeline: [
                        { $match: { role: "athlete" } },
                        { $project: { _id: 1 } }
                    ],
                    as: "athlete"
                }
            },
            { $match: { "athlete.0": { $exists: true } } },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    city: 1,
                    date: 1
                }
            }
        ])
            .hint({ userId: 1, date: 1, city: 1 })
            .exec();
        const data = findMultiCityPairs(workouts);

        res.set(
            "Server-Timing",
            `multi-city;dur=${(performance.now() - startedAt).toFixed(2)}`
        );
        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        res.set(
            "Server-Timing",
            `multi-city;dur=${(performance.now() - startedAt).toFixed(2)}`
        );
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