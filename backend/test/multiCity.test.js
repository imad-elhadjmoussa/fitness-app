const { test } = require("node:test");
const assert = require("node:assert/strict");
const { findMultiCityPairs } = require("../src/utils/multiCity");

test("includes different-city workouts exactly 24 hours apart", () => {
    const pairs = findMultiCityPairs([
        { userId: "athlete-1", city: "Algiers", date: "2026-01-01T10:00:00Z" },
        { userId: "athlete-1", city: "Oran", date: "2026-01-02T10:00:00Z" }
    ]);

    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].gapHours, 24);
});

test("ignores same-city and over-24-hour workout pairs", () => {
    const pairs = findMultiCityPairs([
        { userId: "athlete-1", city: "Algiers", date: "2026-01-01T10:00:00Z" },
        { userId: "athlete-1", city: " algiers ", date: "2026-01-01T11:00:00Z" },
        { userId: "athlete-1", city: "Oran", date: "2026-01-02T11:00:01Z" }
    ]);

    assert.deepEqual(pairs, []);
});

test("does not match workouts across different users", () => {
    const pairs = findMultiCityPairs([
        { userId: "athlete-1", city: "Algiers", date: "2026-01-01T10:00:00Z" },
        { userId: "athlete-2", city: "Oran", date: "2026-01-01T11:00:00Z" }
    ]);

    assert.deepEqual(pairs, []);
});
