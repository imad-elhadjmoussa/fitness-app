const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        role: {
            type: String,
            enum: ["athlete", "coach", "analyst"],
            default: "athlete"
        },

        profile: {
            fitnessGoal: {
                type: String,
                enum: [
                    "weight_loss",
                    "muscle_gain",
                    "maintenance",
                    "endurance",
                    "general_fitness"
                ],
                default: "general_fitness"
            },

            weight: {
                type: Number,
                min: 1
            },

            contact: {
                phone: String,
                address: String
            }
        }
    },
    {
        timestamps: true
    }
);

// Index for email-based lookup
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);