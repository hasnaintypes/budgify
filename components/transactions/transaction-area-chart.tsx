import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { transactions } from "@/data/transactions";
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

interface TransactionAreaChartProps {
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

export function TransactionAreaChart({ dateRange }: TransactionAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const processTransactions = () => {
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
          const date = transaction.date;
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

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Income vs Expense Trends</CardTitle>
          <CardDescription>
            Financial trends over the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="expense"
              type="natural"
              fill="url(#fillExpense)"
              stroke="#f43f5e"
              stackId="a"
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="#10b981"
              stackId="a"
            />
            <ChartLegendContent />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
