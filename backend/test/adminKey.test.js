const { test } = require("node:test");
const assert = require("node:assert/strict");
const requireAdminKey = require("../src/middleware/adminKey");

test("accepts the admin key when configured with surrounding whitespace", () => {
    const previousKey = process.env.ADMIN_API_KEY;
    process.env.ADMIN_API_KEY = " test-admin-key ";
    let passed = false;
    const response = {
        status() {
            return this;
        },
        json() {
            return this;
        }
    };

    try {
        requireAdminKey({ get: () => "test-admin-key" }, response, () => {
            passed = true;
        });
        assert.equal(passed, true);
    } finally {
        if (previousKey === undefined) {
            delete process.env.ADMIN_API_KEY;
        } else {
            process.env.ADMIN_API_KEY = previousKey;
        }
    }
});
