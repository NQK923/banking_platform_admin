import { act, render } from "@testing-library/react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryProvider } from "./query-provider";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

function Capture({ onClient }: { onClient: (client: QueryClient) => void }) {
  const client = useQueryClient();
  useEffect(() => onClient(client), [client, onClient]);
  return null;
}

describe("operator session errors", () => {
  beforeEach(() => replace.mockReset());
  for (const error of ["unauthorized", "forbidden"]) {
    for (const operation of ["query", "mutation"]) {
      it(`${operation} ${error} clears cached operator data before navigation`, async () => {
        let client!: QueryClient;
        render(<QueryProvider><Capture onClient={(value) => { client = value; }} /></QueryProvider>);
        client.setQueryData(["private-accounts"], { balance: "1000" });
        const fail = vi.fn(async () => { throw new Error(error); });
        await act(async () => {
          const request = operation === "query"
            ? client.fetchQuery({ queryKey: ["protected"], queryFn: fail })
            : client.getMutationCache().build(client, { mutationFn: fail }).execute(undefined);
          await expect(request).rejects.toThrow(error);
        });
        expect(client.getQueryData(["private-accounts"])).toBeUndefined();
        expect(replace).toHaveBeenCalledWith(error === "unauthorized" ? "/login" : "/forbidden");
        expect(fail).toHaveBeenCalledOnce();
      });
    }
  }
});
