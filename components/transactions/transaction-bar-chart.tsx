import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { useUser } from "@clerk/nextjs";

interface TransactionBarChartProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981",
  },
  expense: {
    label: "Expense",
    color: "#f43f5e",
  },
} satisfies ChartConfig;

export function TransactionBarChart({ dateRange }: TransactionBarChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d");
  const { user } = useUser();
  const { data: transactions, isLoading } = useTransactions({
    clerkId: user?.id || "",
  });

  const processTransactions = () => {
    if (!transactions || isLoading) return [];

    try {
      const transactionMap = new Map();

      transactions
        .filter((transaction) => {
          try {
            const transactionDate = new Date(transaction.date);
            return (
              transactionDate >= dateRange.from &&
              transactionDate <= dateRange.to
            );
          } catch (error) {
            return false;
          }
        })
        .forEach((transaction) => {
          const date = new Date(transaction.date).toISOString().split("T")[0];
          if (!transactionMap.has(date)) {
            transactionMap.set(date, { date, income: 0, expense: 0 });
          }
          const data = transactionMap.get(date);
          if (transaction.type === "income") {
            data.income += transaction.amount;
          } else {
            data.expense += transaction.amount;
          }
        });

      return Array.from(transactionMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .filter((data) => {
          const date = new Date(data.date);
          const referenceDate = new Date(dateRange.to);
          let daysToSubtract = 90;
          if (timeRange === "30d") {
            daysToSubtract = 30;
          } else if (timeRange === "7d") {
            daysToSubtract = 7;
          }
          const startDate = new Date(referenceDate);
          startDate.setDate(startDate.getDate() - daysToSubtract);
          return date >= startDate;
        });
    } catch (error) {
      return [];
    }
  };

  const chartData = processTransactions();


  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Income vs Expense</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Income vs Expense</CardTitle>
          <CardDescription>
            Financial overview for the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="expense"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />
            <ChartLegendContent />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
