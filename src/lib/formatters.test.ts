import { describe, it, expect } from "vitest";
import { formatMoney } from "./formatters";

describe("formatMoney", () => {
  it("formats standard amounts correctly", () => {
    expect(formatMoney("1000.0000", "VND")).toBe("1,000 VND");
    expect(formatMoney("1000.5000", "VND")).toBe("1,000.5 VND");
    expect(formatMoney("1234567.89", "USD")).toBe("1,234,567.89 USD");
  });

  it("handles negative amounts", () => {
    expect(formatMoney("-500.00", "VND")).toBe("-500 VND");
    expect(formatMoney("-1234.56", "USD")).toBe("-1,234.56 USD");
  });

  it("handles zero and empty values", () => {
    expect(formatMoney("0", "VND")).toBe("0 VND");
    expect(formatMoney("0.0000", "VND")).toBe("0 VND");
    expect(formatMoney(null, "VND")).toBe("0");
    expect(formatMoney(undefined, "VND")).toBe("0");
  });

  it("tolerates numeric JSON values for display only", () => {
    expect(formatMoney(250, "VND")).toBe("250 VND");
    expect(formatMoney(-1234.5, "USD")).toBe("-1,234.5 USD");
  });

  it("handles very large strings without losing precision", () => {
    const largeNumber = "999999999999999999999.99999999999999999999";
    expect(formatMoney(largeNumber, "VND")).toBe(
      "999,999,999,999,999,999,999.99999999999999999999 VND"
    );
  });
});
