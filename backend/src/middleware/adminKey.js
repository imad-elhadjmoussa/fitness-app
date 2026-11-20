const { timingSafeEqual } = require("node:crypto");

module.exports = function requireAdminKey(req, res, next) {
    const expected = (process.env.ADMIN_API_KEY || "").trim();
    const provided = req.get("x-admin-key") || "";

    if (!expected) {
        return res.status(503).json({
            success: false,
            message: "Admin monitoring is not configured"
        });
    }

    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided);
    if (
        expectedBuffer.length !== providedBuffer.length ||
        !timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
        return res.status(403).json({
            success: false,
            message: "Admin access denied"
        });
    }

    next();
};
