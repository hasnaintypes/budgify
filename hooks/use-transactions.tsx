"use client"

import { useState, useEffect, useRef } from "react"
import { transactions } from "@/data/transactions"

export function useTransactions({ limit }: { limit?: number } = {}) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<typeof transactions | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Simulate API call
    timerRef.current = setTimeout(() => {
      let result = [...transactions]

      // Sort by date (newest first)
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Apply limit if provided
      if (limit) {
        result = result.slice(0, limit)
      }

      setData(result)
      setIsLoading(false)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [limit])

  return { data, isLoading }
}

