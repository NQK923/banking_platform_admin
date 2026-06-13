"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  FileText,
  LifeBuoy,
  MailWarning,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Dictionary } from "@/lib/i18n";

export const navItems = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "accounts", href: "/accounts", icon: Users },
  { labelKey: "transactions", href: "/transactions", icon: ArrowRightLeft },
  { labelKey: "riskReviews", href: "/risk", icon: ShieldAlert },
  { labelKey: "support", href: "/support", icon: LifeBuoy },
  { labelKey: "reconciliation", href: "/reconciliation", icon: ShieldCheck },
  { labelKey: "auditLogs", href: "/audit", icon: FileText },
  { labelKey: "dlq", href: "/dlq", icon: MailWarning },
] as const;

export function navLabel(dictionary: Dictionary, key: (typeof navItems)[number]["labelKey"]) {
  return dictionary.nav[key];
}

export function Sidebar() {
  const pathname = usePathname();
  const { dictionary } = useLanguage();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px]">
        <Link href="/" className="flex items-center gap-2 rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm">{dictionary.common.appName}</span>
            <span className="block text-xs font-normal text-muted-foreground">{dictionary.common.adminConsole}</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium" aria-label={dictionary.nav.adminNavigation}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            const label = navLabel(dictionary, item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
