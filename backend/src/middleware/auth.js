const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getToken(req) {
    const header = req.headers.authorization || "";
    if (header.startsWith("Bearer ")) {
        return header.slice(7).trim();
    }
    return null;
}

exports.protect = async (req, res, next) => {
    try {
        const token = getToken(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const secret = process.env.JWT_SECRET || "fitpulse-dev-secret-change-me";
        const decoded = jwt.verify(token, secret);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

exports.requireRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission for this action"
            });
        }
        next();
    };
};
