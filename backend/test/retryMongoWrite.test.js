const { test } = require("node:test");
const assert = require("node:assert/strict");
const { retryMongoWrite } = require("../src/utils/retryMongoWrite");

test("retries transient primary changes and returns after the write succeeds", async () => {
    let attempts = 0;
    const result = await retryMongoWrite(async () => {
        attempts += 1;
        if (attempts < 3) {
            const error = new Error("primary changed");
            error.code = 10107;
            throw error;
        }
        return "saved";
    });

    assert.equal(result, "saved");
    assert.equal(attempts, 3);
});

test("does not retry non-transient write errors", async () => {
    let attempts = 0;
    await assert.rejects(
        retryMongoWrite(async () => {
            attempts += 1;
            const error = new Error("validation failed");
            error.code = 121;
            throw error;
        }),
        /validation failed/
    );

    assert.equal(attempts, 1);
});
