const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!uri) {
            throw new Error(
                "Missing MongoDB URI. Set MONGODB_URI (or MONGO_URI) in backend/.env"
            );
        }

        await mongoose.connect(uri, {
            retryWrites: true,
            writeConcern: { w: "majority" },
            serverSelectionTimeoutMS: 5000
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;