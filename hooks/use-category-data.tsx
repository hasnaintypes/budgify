"use client"

import { useState, useEffect } from "react"
import { transactions } from "@/data/transactions"

type CategoryData = {
  expenses: { name: string; amount: number }[]
  income: { name: string; amount: number }[]
  expensesTotal: number
  incomeTotal: number
}

export function useCategoryData() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<CategoryData | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const expensesByCategory: Record<string, number> = {}
      const incomeByCategory: Record<string, number> = {}

      transactions.forEach((transaction) => {
        if (transaction.type === "expense") {
          expensesByCategory[transaction.category] =
            (expensesByCategory[transaction.category] || 0) + transaction.amount
        } else {
          incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount
        }
      })

      const expenses = Object.entries(expensesByCategory)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)

      const income = Object.entries(incomeByCategory)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)

      const expensesTotal = expenses.reduce((sum, category) => sum + category.amount, 0)
      const incomeTotal = income.reduce((sum, category) => sum + category.amount, 0)

      setData({
        expenses,
        income,
        expensesTotal,
        incomeTotal,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return { data, isLoading }
}

