import { describe, expect, it } from "vitest";

import { normalizePaginatedResponse, parsePageParam } from "@/lib/pagination";

describe("normalizePaginatedResponse", () => {
  it("keeps the admin UI envelope unchanged", () => {
    expect(
      normalizePaginatedResponse({
        items: [{ id: "a" }],
        page: 2,
        size: 10,
        totalElements: 21,
        totalPages: 3,
      })
    ).toEqual({
      items: [{ id: "a" }],
      page: 2,
      size: 10,
      totalElements: 21,
      totalPages: 3,
    });
  });

  it("maps Spring Page content to items", () => {
    expect(
      normalizePaginatedResponse(
        {
          content: [{ id: "a" }, { id: "b" }],
          number: 1,
          size: 2,
          totalElements: 5,
          totalPages: 3,
        },
        0,
        10
      )
    ).toEqual({
      items: [{ id: "a" }, { id: "b" }],
      page: 1,
      size: 2,
      totalElements: 5,
      totalPages: 3,
    });
  });
});
describe("parsePageParam", () => {
  it("handles valid positive integers", () => {
    expect(parsePageParam("1")).toBe(1);
    expect(parsePageParam("2")).toBe(2);
    expect(parsePageParam("100")).toBe(100);
  });

  it("handles missing inputs (null, undefined, empty)", () => {
    expect(parsePageParam(null)).toBe(1);
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("")).toBe(1);
    expect(parsePageParam("   ")).toBe(1);
  });

  it("handles invalid inputs (non-numeric, NaN)", () => {
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("NaN")).toBe(1);
    expect(parsePageParam("1abc")).toBe(1);
  });

  it("handles zero", () => {
    expect(parsePageParam("0")).toBe(1);
  });

  it("handles negative numbers", () => {
    expect(parsePageParam("-1")).toBe(1);
    expect(parsePageParam("-100")).toBe(1);
  });

  it("handles Infinity and -Infinity", () => {
    expect(parsePageParam("Infinity")).toBe(1);
    expect(parsePageParam("-Infinity")).toBe(1);
  });

  it("handles decimal numbers", () => {
    expect(parsePageParam("1.5")).toBe(1);
    expect(parsePageParam("0.5")).toBe(1);
    expect(parsePageParam("2.0001")).toBe(1);
  });

  it("handles non-canonical numeric inputs", () => {
    expect(parsePageParam("1e2")).toBe(1);
    expect(parsePageParam("0x10")).toBe(1);
    expect(parsePageParam("+2")).toBe(1);
    expect(parsePageParam(" 2 ")).toBe(1);
    expect(parsePageParam("001")).toBe(1);
  });
});
