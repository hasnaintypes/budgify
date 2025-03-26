"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpIcon, ArrowDownIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function TransactionHistory() {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const itemsPerPage = 7

  const { data, isLoading } = useTransactions()

  // Generate year and month options
  const years = data ? [...new Set(data.map((t) => new Date(t.date).getFullYear()))].sort((a, b) => b - a) : []
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  // Filter transactions
  const filteredTransactions = data?.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase())

    const date = new Date(transaction.date)
    const matchesYear = yearFilter === "all" || date.getFullYear().toString() === yearFilter
    const matchesMonth = monthFilter === "all" || (date.getMonth() + 1).toString() === monthFilter

    return matchesSearch && matchesYear && matchesMonth
  })

  // Pagination
  const totalPages = filteredTransactions ? Math.ceil(filteredTransactions.length / itemsPerPage) : 0
  const paginatedTransactions = filteredTransactions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, yearFilter, monthFilter])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A list of all your transactions</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="p-2 space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Year</label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Month</label>
                    <Select value={monthFilter} onValueChange={setMonthFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              transaction.type === "income"
                                ? "bg-emerald-100 dark:bg-emerald-900"
                                : "bg-rose-100 dark:bg-rose-900"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                            )}
                          </div>
                          <div>
                            <div>{transaction.description}</div>
                            <div className="sm:hidden text-xs text-muted-foreground">
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={
                            transaction.type === "income"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                          }
                        >
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(transaction.date)}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions?.length || 0)} of{" "}
                  {filteredTransactions?.length || 0}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or add new transactions</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

