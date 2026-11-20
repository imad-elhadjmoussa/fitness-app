const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function signToken(userId) {
    const secret = process.env.JWT_SECRET || "fitpulse-dev-secret-change-me";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign({ id: userId }, secret, { expiresIn });
}

function sanitize(user) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
}

// ======================================
// CREATE USER (register)
// POST /api/users
// ======================================

exports.createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            profile,
            role
        } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const allowedRoles = ["athlete", "coach", "analyst"];
        const safeRole =
            role && allowedRoles.includes(role) ? role : "athlete";

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: safeRole,
            profile
        });

        const token = signToken(user._id.toString());
        const userResponse = sanitize(user);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: userResponse
            }
        });
    } catch (error) {
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
// LIST USERS
// GET /api/users
// ======================================

exports.getUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving users",
            error: error.message
        });
    }
};

// Public, read-only athlete directory. Do not expose contact details or email.
exports.getPublicAthletes = async (_req, res) => {
    try {
        const users = await User.find({ role: "athlete" })
            .select("firstName lastName role profile.fitnessGoal profile.weight createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving athletes",
            error: error.message
        });
    }
};

exports.getPublicAthlete = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findOne({ _id: userId, role: "athlete" })
            .select("firstName lastName role profile.fitnessGoal profile.weight createdAt updatedAt")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving athlete",
            error: error.message
        });
    }
};

// ======================================
// GET USER PROFILE
// GET /api/users/:userId
// ======================================

exports.getUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving user",
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

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Athletes may only update their own profile
        if (
            req.user &&
            req.user.role === "athlete" &&
            req.user._id.toString() !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own profile"
            });
        }

        const { fitnessGoal, weight, contact } = req.body;
        const updates = {};

        if (fitnessGoal !== undefined) {
            updates["profile.fitnessGoal"] = fitnessGoal;
        }

        if (weight !== undefined) {
            updates["profile.weight"] = weight;
        }

        if (contact !== undefined) {
            if (
                typeof contact !== "object" ||
                contact === null ||
                Array.isArray(contact)
            ) {
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

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid profile fields provided"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
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
