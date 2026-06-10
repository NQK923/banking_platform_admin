"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth.actions";
import { useActionState } from "react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [, formAction, pending] = useActionState(logout, null);

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border/70 bg-background/85 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:h-[60px]">
      <div className="flex flex-1">
        <div className="hidden text-xs font-medium uppercase tracking-normal text-muted-foreground sm:block">
          Operator Console
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <div className="flex items-center gap-2 rounded-md border bg-card px-2 py-1 text-sm font-medium">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="hidden md:inline-block">Admin User</span>
        </div>
        <form action={formAction}>
          <Button variant="outline" size="sm" type="submit" disabled={pending}>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            {pending ? "Logging out..." : "Logout"}
          </Button>
        </form>
      </div>
    </header>
  );
}
