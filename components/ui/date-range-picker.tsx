"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date;
  to: Date;
};

type DateRangePickerProps = {
  date: DateRange;
  setDate: (date: DateRange) => void;
  className?: string;
};

export function DateRangePicker({
  date,
  setDate,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const predefinedRanges = [
    { name: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
    {
      name: "Yesterday",
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      name: "Last 7 days",
      getValue: () => {
        const today = new Date();
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 6);
        return { from: last7Days, to: today };
      },
    },
    {
      name: "Last 30 days",
      getValue: () => {
        const today = new Date();
        const last30Days = new Date();
        last30Days.setDate(today.getDate() - 29);
        return { from: last30Days, to: today };
      },
    },
    {
      name: "This Month",
      getValue: () => {
        const today = new Date();
        return {
          from: new Date(today.getFullYear(), today.getMonth(), 1),
          to: today,
        };
      },
    },
  ];

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d")} -{" "}
                  {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 mr-4" align="start">
          <div className="flex">
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={{ from: date.from, to: date.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDate({ from: range.from, to: range.to });
                    setIsOpen(false);
                  }
                }}
                numberOfMonths={1}
              />
            </div>
            {/* Adjusted width of predefined ranges */}
            <div className="border-l p-1.5 min-w-[100px] w-[120px]">
              <div className="space-y-0.5">
                {predefinedRanges.map((range) => (
                  <Button
                    key={range.name}
                    variant="ghost"
                    className="w-full justify-start text-left font-normal h-8 px-2 text-sm"
                    onClick={() => {
                      const newRange = range.getValue();
                      setDate(newRange);
                      setIsOpen(false);
                    }}
                  >
                    {range.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
