"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--accent),transparent_34%),var(--background)] p-4">
      <Card className="w-full min-w-0 max-w-xs border-border/70 bg-card/95 py-5 shadow-xl ring-0 backdrop-blur sm:max-w-sm">
        <CardHeader className="min-w-0 space-y-1 px-5 text-center sm:px-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <CardTitle className="font-sans text-2xl font-extrabold tracking-tight">Banking Platform Admin</CardTitle>
          <CardDescription className="break-words">
            Enter your credentials to access the internal dashboard.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="min-w-0 space-y-5 px-5 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                className="h-10 rounded-md bg-secondary/50 font-sans"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-sans font-semibold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="h-10 rounded-md bg-secondary/50 font-sans"
                required
                disabled={pending}
              />
            </div>
            {state?.error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2 text-center text-sm font-medium text-destructive">
                {state.error}
              </div>
            )}
            <Button
              className="mt-1 h-11 w-full rounded-md font-sans font-bold text-primary-foreground shadow-sm"
              type="submit"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Authenticating...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
