const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// ======================================
// CREATE USER
// POST /api/users
// ======================================

exports.createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            profile
        } = req.body;

        // Required field validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, email and password are required"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profile
        });

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userResponse
        });

    } catch (error) {
        // Handle duplicate email race conditions
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};


// ======================================
// UPDATE USER PROFILE
// PATCH /api/users/:userId/profile
// ======================================

exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const { fitnessGoal, weight, contact } = req.body;

        // Build dynamic update object
        const updates = {};

        if (fitnessGoal !== undefined) {
            updates["profile.fitnessGoal"] = fitnessGoal;
        }

        if (weight !== undefined) {
            updates["profile.weight"] = weight;
        }

        if (contact !== undefined) {
            if (typeof contact !== "object" || contact === null ||
                Array.isArray(contact)) {
                return res.status(400).json({
                    success: false,
                    message: "Contact must be an object"
                });
            }

            const allowedContactFields = ["phone", "address"];

            for (const key of Object.keys(contact)) {
                if (!allowedContactFields.includes(key)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid contact field: ${key}`
                    });
                }
            }

            if (contact.phone !== undefined) {
                updates["profile.contact.phone"] = contact.phone;
            }

            if (contact.address !== undefined) {
                updates["profile.contact.address"] = contact.address;
            }
        }

        // Prevent empty updates
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid profile fields provided"
            });
        }

        // Update only modified fields
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};