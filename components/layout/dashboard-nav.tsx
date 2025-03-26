"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PieChartIcon as ChartPieIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ChartPieIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline-block">
              Budgify
            </span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/transactions"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Transactions
            </Link>
            <Link
              href="/manage"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/manage"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Manage
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
