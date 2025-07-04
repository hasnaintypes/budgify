"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Download, RefreshCw } from "lucide-react";
import { CategoriesSection } from "@/components/manage/categories-section";
import { SettingsSection } from "@/components/manage/settings-section";
import { DataManagementSection } from "@/components/manage/data-management-section";
import { RecurringTransactionsSection } from "@/components/manage/recurring-transactions-section";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type ActiveSection = "categories" | "settings" | "data" | "recurring";

export default function ManageComponent() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("categories");
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const userDetails = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage</h1>
        <p className="text-muted-foreground">
          Manage your categories, recurring transactions, and settings
        </p>
      </div>

      {/* Mobile navigation - horizontal scrolling tabs */}
      <div className="md:hidden border rounded-lg overflow-x-auto">
        <div className="flex p-1 min-w-full">
          <Button
            variant={activeSection === "categories" ? "default" : "ghost"}
            className="flex-1 whitespace-nowrap"
            onClick={() => setActiveSection("categories")}
          >
            <Database className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button
            variant={activeSection === "recurring" ? "default" : "ghost"}
            className="flex-1 whitespace-nowrap"
            onClick={() => setActiveSection("recurring")}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recurring
          </Button>
          <Button
            variant={activeSection === "settings" ? "default" : "ghost"}
            className="flex-1 whitespace-nowrap"
            onClick={() => setActiveSection("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant={activeSection === "data" ? "default" : "ghost"}
            className="flex-1 whitespace-nowrap"
            onClick={() => setActiveSection("data")}
          >
            <Download className="mr-2 h-4 w-4" />
            Data
          </Button>
        </div>
      </div>

      {/* Desktop layout - sidebar with content */}
      <div className="hidden md:flex border rounded-lg overflow-hidden">
        <div className="w-64 border-r bg-muted/30">
          <div className="p-4 flex flex-col gap-2">
            <Button
              variant={activeSection === "categories" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("categories")}
            >
              <Database className="mr-2 h-4 w-4" />
              Categories
            </Button>
            <Button
              variant={activeSection === "recurring" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("recurring")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recurring Transactions
            </Button>
            <Button
              variant={activeSection === "settings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant={activeSection === "data" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("data")}
            >
              <Download className="mr-2 h-4 w-4" />
              Data Management
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          {activeSection === "categories" && isAuthenticated && userDetails && (
            <CategoriesSection userId={userDetails._id} />
          )}
          {activeSection === "recurring" && <RecurringTransactionsSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "data" && <DataManagementSection />}
        </div>
      </div>

      {/* Mobile content area */}
      <div className="md:hidden">
        {activeSection === "categories" && isAuthenticated && userDetails && (
          <CategoriesSection userId={userDetails._id} />
        )}
        {activeSection === "recurring" && <RecurringTransactionsSection />}
        {activeSection === "settings" && <SettingsSection />}
        {activeSection === "data" && <DataManagementSection />}
      </div>
    </div>
  );
}
