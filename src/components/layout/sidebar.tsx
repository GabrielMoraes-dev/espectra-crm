"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ChevronsLeft } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STORAGE_KEY = "espectra:sidebar-collapsed";

export function AppSidebar({
  nomeEmpresa,
  logoUrl,
  pendenciasBadge = 0,
}: {
  nomeEmpresa?: string;
  logoUrl?: string | null;
  pendenciasBadge?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted UI preference on mount
    if (stored === "1") setCollapsed(true);
    setMounted(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, prev ? "0" : "1");
      return !prev;
    });
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className={cn(
        "relative hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
        !mounted && "transition-none",
      )}
    >
      <div className="flex h-16 items-center px-4">
        <Logo collapsed={collapsed} nomeEmpresa={nomeEmpresa} logoUrl={logoUrl} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 h-5 w-0.5 rounded-full bg-brand-300"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.href === "/" && pendenciasBadge > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[11px] font-semibold text-warning-foreground",
                    collapsed ? "absolute -right-1 -top-1" : "ml-auto",
                  )}
                >
                  {pendenciasBadge}
                </span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={link} />
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <ChevronsLeft className="size-[18px]" />
          </motion.span>
          {!collapsed && <span className="text-sm font-medium">Recolher</span>}
        </button>
      </div>
    </motion.aside>
  );
}
