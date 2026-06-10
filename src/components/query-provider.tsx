"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error.message === "unauthorized") {
              window.location.href = "/login";
            } else if (error.message === "forbidden") {
              window.location.href = "/forbidden";
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error.message === "unauthorized") {
              window.location.href = "/login";
            } else if (error.message === "forbidden") {
              window.location.href = "/forbidden";
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
