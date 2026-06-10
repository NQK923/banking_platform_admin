"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth.actions";
import { useActionState } from "react";
import { navItems } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [, formAction, pending] = useActionState(logout, null);
  const pathname = usePathname();

  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex min-h-14 items-center justify-between gap-3 px-3 sm:px-4 md:px-6 lg:h-[60px]">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground lg:hidden">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold lg:hidden">Banking Platform</div>
            <div className="hidden text-xs font-medium uppercase tracking-normal text-muted-foreground sm:block">
              Operator Console
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
          <div className="hidden items-center gap-2 rounded-md border bg-card px-2 py-1 text-sm font-medium sm:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="hidden md:inline-block">Admin User</span>
          </div>
          <form action={formAction}>
            <Button variant="outline" size="sm" type="submit" disabled={pending} aria-label={pending ? "Logging out" : "Logout"}>
              <LogOut className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{pending ? "Logging out..." : "Logout"}</span>
            </Button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-2 py-2 text-sm font-medium lg:hidden" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
