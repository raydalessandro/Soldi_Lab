"use client";

import {
  Activity,
  Banknote,
  Home,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/floor", label: "Floor", icon: Wallet },
  { href: "/income", label: "Entrate", icon: Banknote },
  { href: "/patrimony", label: "Patrimonio", icon: TrendingUp },
  { href: "/cycle", label: "Ciclo", icon: Activity },
  { href: "/advisor", label: "Advisor", icon: Sparkles },
] as const;

function isActive(currentPath: string, href: string): boolean {
  if (href === "/") return currentPath === "/" || currentPath === "";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed right-0 bottom-0 left-0 z-20 border-t border-stone-200 bg-white px-1 py-2"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 transition-colors",
                active ? "text-stone-900" : "text-stone-400",
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.5 : 2}
                aria-hidden
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
