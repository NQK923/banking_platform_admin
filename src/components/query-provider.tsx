"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState<QueryClient>(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: (count, error) => !["unauthorized", "forbidden"].includes(error.message) && count < 1,
          refetchOnWindowFocus: false,
        },
      },
    });
    const onError = (error: Error) => {
      if (error.message === "unauthorized" || error.message === "forbidden") {
        client.clear();
        router.replace(error.message === "unauthorized" ? "/login" : "/forbidden");
      }
    };
    client.getQueryCache().config.onError = onError;
    client.getMutationCache().config.onError = onError;
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
