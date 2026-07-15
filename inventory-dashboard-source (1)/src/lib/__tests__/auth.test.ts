import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, unsignToken } from "../auth";

describe("hashPassword / verifyPassword", () => {
  it("produces a salted hash that is not the plain password", () => {
    const hash = hashPassword("mySecret123");
    expect(hash).not.toBe("mySecret123");
    expect(hash).toContain(":");
  });

  it("produces a unique hash for the same password (random salt)", () => {
    const h1 = hashPassword("samePass");
    const h2 = hashPassword("samePass");
    expect(h1).not.toBe(h2);
  });

  it("verifies the correct password", () => {
    const hash = hashPassword("correctHorse");
    expect(verifyPassword("correctHorse", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("correctHorse");
    expect(verifyPassword("wrongPassword", hash)).toBe(false);
  });

  it("rejects empty string password", () => {
    const hash = hashPassword("realPass");
    expect(verifyPassword("", hash)).toBe(false);
  });

  it("returns false for malformed hash", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
    expect(verifyPassword("anything", "")).toBe(false);
    expect(verifyPassword("anything", "onlysalt")).toBe(false);
  });
});

describe("unsignToken", () => {
  // We can't import signToken (not exported) but we can test the validation
  // logic with known-good and known-bad tokens.

  it("returns null for a token without a dot separator", () => {
    expect(unsignToken("nodothere")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(unsignToken("")).toBeNull();
  });

  it("returns null for a tampered signature", () => {
    // valid-format but wrong signature
    expect(
      unsignToken("abc123def456.0000000000000000000000000000000000000000")
    ).toBeNull();
  });
});
