import type { PaginatedResponse } from "@/lib/types";

type SpringPage<T> = {
  content?: T[];
  number?: number;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

export function normalizePaginatedResponse<T>(
  payload: PaginatedResponse<T> | SpringPage<T> | T[] | null | undefined,
  fallbackPage = 0,
  fallbackSize = 10
): PaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: fallbackPage,
      size: fallbackSize,
      totalElements: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
    };
  }

  const source = payload ?? {};
  const items = Array.isArray((source as PaginatedResponse<T>).items)
    ? (source as PaginatedResponse<T>).items
    : Array.isArray((source as SpringPage<T>).content)
      ? (source as SpringPage<T>).content!
      : [];

  return {
    items,
    page:
      typeof (source as PaginatedResponse<T>).page === "number"
        ? (source as PaginatedResponse<T>).page
        : typeof (source as SpringPage<T>).number === "number"
          ? (source as SpringPage<T>).number!
          : fallbackPage,
    size:
      typeof source.size === "number"
        ? source.size
        : fallbackSize,
    totalElements:
      typeof source.totalElements === "number"
        ? source.totalElements
        : items.length,
    totalPages:
      typeof source.totalPages === "number"
        ? source.totalPages
        : items.length > 0
          ? 1
          : 0,
  };
}

export function parsePageParam(value: string | null | undefined): number {
  if (value === null || value === undefined || value.trim() === "") {
    return 1;
  }
  if (!/^[1-9]\d*$/.test(value)) {
    return 1;
  }
  const num = Number(value);
  if (!Number.isInteger(num)) {
    return 1;
  }
  return num;
}
