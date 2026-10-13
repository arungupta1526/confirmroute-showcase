import test from "node:test";
import assert from "node:assert/strict";
import {
  GUEST_DAILY_LIMIT,
  LOGGED_IN_DAILY_LIMIT,
  getTodayKeyIST,
  getUsageCount,
  incrementUsageCount,
} from "../../src/lib/quota/showcaseQuota.ts";

test("Showcase Quota Constants", () => {
  assert.equal(GUEST_DAILY_LIMIT, 15, "Guest daily limit should be 15");
  assert.equal(LOGGED_IN_DAILY_LIMIT, 50, "Logged-in user daily limit should be 50");
});

test("Date Key Formatting (IST)", () => {
  const dateKey = getTodayKeyIST();
  assert.match(dateKey, /^\d{4}-\d{2}-\d{2}$/, "Date key must match YYYY-MM-DD");
});

test("Usage Tracking Increment", () => {
  const testKey = `test_identity_${Date.now()}`;
  assert.equal(getUsageCount(testKey), 0, "Initial usage should be 0");
  const count1 = incrementUsageCount(testKey);
  assert.equal(count1, 1, "First increment should be 1");
  assert.equal(getUsageCount(testKey), 1, "Usage count should reflect increment");
});
