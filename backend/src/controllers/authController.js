const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = signToken(user._id.toString());

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                token,
                user: sanitize(user)
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message
        });
    }
};

// GET /api/auth/me
exports.me = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user
    });
};
