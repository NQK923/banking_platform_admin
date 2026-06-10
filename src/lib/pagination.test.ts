import { describe, expect, it } from "vitest";

import { normalizePaginatedResponse } from "@/lib/pagination";

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
