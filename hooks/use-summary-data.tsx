"use client"

import { useState, useEffect } from "react"
import { transactions } from "@/data/transactions"

export function useSummaryData() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    total: number
    income: number
    expenses: number
  } | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      setData({
        total: income - expenses,
        income,
        expenses,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return { data, isLoading }
}

