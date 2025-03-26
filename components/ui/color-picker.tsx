"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Predefined color palette
const colorPalette = [
  // Reds
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
  // Oranges
  "#f97316",
  "#ea580c",
  "#c2410c",
  "#9a3412",
  "#7c2d12",
  // Ambers
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
  // Yellows
  "#eab308",
  "#ca8a04",
  "#a16207",
  "#854d0e",
  "#713f12",
  // Limes
  "#84cc16",
  "#65a30d",
  "#4d7c0f",
  "#3f6212",
  "#365314",
  // Greens
  "#22c55e",
  "#16a34a",
  "#15803d",
  "#166534",
  "#14532d",
  // Emeralds
  "#10b981",
  "#059669",
  "#047857",
  "#065f46",
  "#064e3b",
  // Teals
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  "#115e59",
  "#134e4a",
  // Cyans
  "#06b6d4",
  "#0891b2",
  "#0e7490",
  "#155e75",
  "#164e63",
  // Blues
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  "#1e3a8a",
  // Indigos
  "#6366f1",
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#312e81",
  // Violets
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
  // Purples
  "#a855f7",
  "#9333ea",
  "#7e22ce",
  "#6b21a8",
  "#581c87",
  // Fuchsias
  "#d946ef",
  "#c026d3",
  "#a21caf",
  "#86198f",
  "#701a75",
  // Pinks
  "#ec4899",
  "#db2777",
  "#be185d",
  "#9d174d",
  "#831843",
  // Roses
  "#f43f5e",
  "#e11d48",
  "#be123c",
  "#9f1239",
  "#881337",
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
}

export function ColorPicker({
  selectedColor,
  onColorSelect,
  className,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // When the popover opens, set the custom color to the selected color
  React.useEffect(() => {
    setCustomColor(selectedColor);
  }, [selectedColor]);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorSubmit = () => {
    // Basic validation for hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(customColor)) {
      onColorSelect(customColor);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCustomColorSubmit();
    }
  };

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
          <div
            className="mr-2 h-4 w-4 rounded-full border"
            style={{ backgroundColor: selectedColor }}
          />
          <span>Select a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-3" align="start">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-3">
          {colorPalette.map((color) => (
            <Button
              key={color}
              variant="ghost"
              className="h-8 w-8 p-0 rounded-md relative"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={color}
            >
              {color === selectedColor && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                </div>
              )}
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
          <div className="flex-1 w-full">
            <Input
              ref={inputRef}
              type="text"
              value={customColor}
              onChange={handleCustomColorChange}
              onKeyDown={handleKeyDown}
              placeholder="#000000"
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-md border"
              style={{ backgroundColor: customColor }}
            />
            <Button size="sm" onClick={handleCustomColorSubmit} className="h-8">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
