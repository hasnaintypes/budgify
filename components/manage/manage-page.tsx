"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Download } from "lucide-react";
import { CategoriesSection } from "@/components/manage/categories-section";
import SettingsSection from "./settings-section";
import { DataManagementSection } from "@/components/manage/data-management-section";

type ActiveSection = "categories" | "settings" | "data";

export default function ManagePage() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("categories");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage</h1>
        <p className="text-muted-foreground">
          Manage your categories and settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row border rounded-lg overflow-hidden">
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/30">
          <div className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            <Button
              variant={activeSection === "categories" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("categories")}
            >
              <Database className="mr-2 h-4 w-4" />
              Categories
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

        <div className="flex-1 p-4 md:p-6">
          {activeSection === "categories" && <CategoriesSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "data" && <DataManagementSection />}
        </div>
      </div>
    </div>
  );
}
