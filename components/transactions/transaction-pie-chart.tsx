"use client";

import { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import type { DateRange } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/clerk-react";
import { useCategoryTransactions } from "@/hooks/use-category-transactions";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Color palette for the pie chart moved outside component
const incomeColors = [
  "#10b981",
  "#047857",
  "#059669",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#15803d", // Changed from duplicate #34d399
  "#065f46",
  "#047857",
  "#0d9488",
];

const expenseColors = [
  "#f43f5e",
  "#e11d48",
  "#be123c",
  "#fb7185",
  "#fda4af",
  "#fecdd3",
  "#be185d",
  "#9d174d",
  "#831843",
  "#9f1239",
];

interface TransactionPieChartProps {
  type: "income" | "expense";
  dateRange: DateRange;
}

export function TransactionPieChart({
  type,
  dateRange,
}: TransactionPieChartProps) {
  const { user } = useUser();
  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const categories = useQuery(
    api.categories.getAllCategories,
    userData?._id ? { userId: userData._id } : "skip"
  );
  const isCategoriesLoading = !userData || categories === undefined;

  const [chartData, setChartData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colorPalette = type === "income" ? incomeColors : expenseColors;

  const allTransactions = useQuery(
    api.transactions.getTransactionsByUser,
    userData?._id ? { userId: userData._id } : "skip"
  );

  useEffect(() => {
    if (!user?.id || !dateRange.from || !dateRange.to || !categories) return;

    // Get all category transactions data first
    // Get all transactions first

    const categoryTransactionsData =
      categories
        ?.filter((category) => category.type === type)
        ?.map((category) => {
          const categoryTransactions =
            allTransactions?.filter((t) => t.categoryId === category._id) ?? [];
          const total = categoryTransactions.reduce(
            (sum, t) => sum + t.amount,
            0
          );

          return {
            name: category.name,
            value: total,
            color:
              colorPalette[categories.indexOf(category) % colorPalette.length],
          };
        }) ?? [];

    // Process data
    const processedData = categoryTransactionsData.filter(
      (item) => item.value > 0
    );

    // Sort by amount (descending) and take top 6
    const sortedData = processedData
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    setChartData(sortedData);
  }, [categories, user?.id, dateRange, type, colorPalette]);

  if (isCategoriesLoading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center">
        <p className="text-muted-foreground">
          No data available for the selected date range
        </p>
      </div>
    );
  }

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-[250px] w-full">
      <div className="flex h-full">
        <div className="w-1/2 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Render pie chart segments */}
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100;

              // Calculate position in the pie chart
              const startAngle = chartData
                .slice(0, index)
                .reduce((sum, val) => sum + (val.value / total) * 360, 0);
              const endAngle = startAngle + (item.value / total) * 360;

              // Convert to radians
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);

              // Calculate points
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);

              // Large arc flag
              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

              // Create SVG path
              const path = `
                M 50 50
                L ${x1} ${y1}
                A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;

              return (
                <g key={item.name}>
                  <path
                    d={path}
                    fill={item.color}
                    stroke={isDark ? "#1e1e2f" : "#ffffff"}
                    strokeWidth="1"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    role="presentation"
                    aria-label={`${item.name}: ${formatCurrency(item.value)} (${percentage.toFixed(1)}%)`}
                  >
                    <title>
                      {`${item.name} - ${formatCurrency(item.value)} (${percentage.toFixed(1)}% of total)`}
                    </title>
                  </path>
                </g>
              );
            })}

            {/* Center circle for donut chart effect */}
            <circle cx="50" cy="50" r="25" fill="var(--background)" />
          </svg>
        </div>

        <div className="w-1/2 flex flex-col justify-center space-y-3 pl-4">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div
                className="h-3 w-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1 text-sm truncate" title={item.name}>
                {item.name}
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
