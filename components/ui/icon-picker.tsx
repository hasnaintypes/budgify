"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { Search } from "lucide-react";

type IconName = keyof typeof LucideIcons;

// Curated list of 100 most common icons for an expense tracker
const commonIcons: IconName[] = [
  // Finance & Money
  "CircleDollarSign",
  "DollarSign",
  "Wallet",
  "CreditCard",
  "Receipt",
  "Landmark",
  "PiggyBank",
  "Coins",
  "Banknote",
  "Percent",
  "TrendingUp",
  "TrendingDown",
  "BarChart",
  "LineChart",
  "PieChart",
  "ArrowUpRight",
  "ArrowDownRight",
  "BadgeDollarSign",

  // Shopping & Expenses
  "ShoppingCart",
  "ShoppingBag",
  "Store",
  "Package",
  "Gift",
  "Tag",
  "Truck",
  "ShoppingBasket",
  "Ticket",

  // Food & Dining
  "Utensils",
  "Coffee",
  "Wine",
  "Pizza",
  "Sandwich",
  "Apple",
  "Beef",
  "Egg",
  "IceCream",
  "Soup",

  // Transportation
  "Car",
  "Bus",
  "Train",
  "Plane",
  "Bike",
  "Fuel",
  "Navigation",
  "MapPin",
  "Route",

  // Home & Utilities
  "Home",
  "Building",
  "Lightbulb",
  "Plug",
  "Wifi",
  "Phone",
  "Smartphone",
  "Tv",
  "Monitor",
  "Laptop",

  // Health & Wellness
  "Stethoscope",
  "Pill",
  "Heart",
  "Activity",
  "Dumbbell",
  "Bath",
  "Scissors",

  // Entertainment & Leisure
  "Film",
  "Music",
  "Headphones",
  "GamepadIcon",
  "Popcorn",
  "Ticket",
  "BookOpen",
  "Newspaper",
  "Palette",
  "Camera",

  // Work & Education
  "Briefcase",
  "GraduationCap",
  "Book",
  "FileText",
  "PenTool",
  "Ruler",
  "School",
  "Library",

  // Time & Calendar
  "Calendar",
  "Clock",
  "Timer",
  "CalendarDays",
  "CalendarClock",

  // People & Social
  "Users",
  "User",
  "UserPlus",
  "Baby",
  "Heart",

  // Misc & UI
  "Plus",
  "Minus",
  "Check",
  "X",
  "AlertCircle",
  "Info",
  "Settings",
  "Filter",
  "Search",
  "Star",
  "ArrowUp",
  "ArrowDown",
  "Edit",
  "Trash",
  "Save",
  "Download",
  "Upload",
  "Repeat",
  "RotateCcw",
];

interface IconPickerProps {
  selectedIcon: IconName;
  onIconSelect: (icon: IconName) => void;
  className?: string;
}

export function IconPicker({
  selectedIcon,
  onIconSelect,
  className,
}: IconPickerProps) {
  const [search, setSearch] = React.useState("");

  // Filter icons based on search
  const filteredIcons =
    search.trim() === ""
      ? commonIcons
      : commonIcons.filter((name) =>
          name.toLowerCase().includes(search.toLowerCase())
        );

  // Get the selected icon component
  const SelectedIcon =
    (LucideIcons[selectedIcon] as LucideIcons.LucideIcon) ||
    LucideIcons.CircleDollarSign;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            className
          )}
        >
          <SelectedIcon className="mr-2 h-4 w-4" />
          <span>Select an icon</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground ml-2" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((name) => {
                // Check if the icon exists in LucideIcons
                if (!LucideIcons[name]) return null;

                const Icon = LucideIcons[name] as LucideIcons.LucideIcon;
                return (
                  <Button
                    key={name}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-md relative",
                      selectedIcon === name && "bg-primary/10"
                    )}
                    title={name.replace(/([A-Z])/g, " $1").trim()}
                    onClick={() => onIconSelect(name)}
                  >
                    <Icon className="h-5 w-5" />
                    {selectedIcon === name && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-md">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </Button>
                );
              })
            ) : (
              <div className="col-span-4 sm:col-span-5 flex h-32 items-center justify-center text-sm text-muted-foreground">
                No icons found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
