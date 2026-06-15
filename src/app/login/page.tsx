"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);
  const { dictionary } = useLanguage();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,var(--accent),transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--primary)/10,transparent_50%),var(--background)] p-4 overflow-hidden">
      {/* Decorative background blur shapes */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <Card className="w-full min-w-0 max-w-xs border-border/40 bg-card/70 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-0 backdrop-blur-lg sm:max-w-sm transition-all duration-300 hover:border-primary/20">
        <div className="flex justify-end px-5 sm:px-6">
          <LanguageToggle />
        </div>
        <CardHeader className="min-w-0 space-y-1.5 px-5 text-center sm:px-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm animate-float">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <CardTitle className="font-sans text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{dictionary.login.title}</CardTitle>
          <CardDescription className="break-words text-muted-foreground/80">
            {dictionary.login.description}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="min-w-0 space-y-5 px-5 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans font-semibold text-sm tracking-wide">{dictionary.login.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={dictionary.login.placeholder}
                className="h-10 rounded-lg border-border/50 bg-secondary/30 font-sans focus:bg-secondary/10 transition-all"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-sans font-semibold text-sm tracking-wide">{dictionary.login.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="h-10 rounded-lg border-border/50 bg-secondary/30 font-sans focus:bg-secondary/10 transition-all"
                required
                disabled={pending}
              />
            </div>
            {state?.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-center text-sm font-medium text-destructive animate-pulse-glow">
                {state.error}
              </div>
            )}
            <Button
              className="mt-1 h-11 w-full rounded-lg font-sans font-bold text-primary-foreground bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              type="submit"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                  {dictionary.login.authenticating}
                </>
              ) : (
                dictionary.login.signIn
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
