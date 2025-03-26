"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactions } from "@/hooks/use-transactions"
import type { DateRange } from "@/components/ui/date-range-picker"
import { formatCurrency } from "@/lib/utils"

interface TransactionSummaryCardsProps {
  dateRange: DateRange
}

export function TransactionSummaryCards({ dateRange }: TransactionSummaryCardsProps) {
  const { data, isLoading } = useTransactions()
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
    avgIncome: 0,
    avgExpense: 0,
  })

  useEffect(() => {
    if (!data) return

    // Filter transactions by date range
    const filteredData = data.filter((transaction) => {
      const date = new Date(transaction.date)
      return date >= dateRange.from && date <= dateRange.to
    })

    // Calculate summary
    const income = filteredData.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = filteredData.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const incomeCount = filteredData.filter((t) => t.type === "income").length
    const expenseCount = filteredData.filter((t) => t.type === "expense").length

    setSummary({
      income,
      expenses,
      balance: income - expenses,
      incomeCount,
      expenseCount,
      avgIncome: incomeCount > 0 ? income / incomeCount : 0,
      avgExpense: expenseCount > 0 ? expenses / expenseCount : 0,
    })
  }, [data, dateRange])

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="h-4 w-[80px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.income)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{summary.incomeCount} transactions</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-rose-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(summary.expenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">{summary.expenseCount} transactions</p>
        </CardContent>
      </Card>

      <Card
        className={`overflow-hidden border-l-4 ${summary.balance >= 0 ? "border-l-emerald-500" : "border-l-rose-500"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          {summary.balance >= 0 ? (
            <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDownIcon className="h-4 w-4 text-rose-500" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              summary.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(Math.abs(summary.balance))}
            {summary.balance < 0 && " deficit"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">For selected period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          <div className="flex -space-x-1">
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Income:</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.avgIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Expense:</span>
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {formatCurrency(summary.avgExpense)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

