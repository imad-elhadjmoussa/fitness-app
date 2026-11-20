const RETRYABLE_MONGO_CODES = new Set([
    6,
    7,
    89,
    91,
    189,
    9001,
    10107,
    11600,
    11602,
    13435,
    13436
]);

function isRetryableMongoError(error) {
    if (typeof error?.hasErrorLabel === "function" &&
        error.hasErrorLabel("RetryableWriteError")) {
        return true;
    }

    return RETRYABLE_MONGO_CODES.has(error?.code) ||
        [
            "MongoNetworkError",
            "MongoNetworkTimeoutError",
            "MongoServerSelectionError",
            "MongooseServerSelectionError"
        ].includes(error?.name);
}

async function retryMongoWrite(operation) {
    const maxAttempts = 4;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            if (!isRetryableMongoError(error) || attempt === maxAttempts - 1) {
                throw error;
            }

            await new Promise((resolve) => setTimeout(resolve, 100 * (2 ** attempt)));
        }
    }
}

module.exports = { retryMongoWrite, isRetryableMongoError };
