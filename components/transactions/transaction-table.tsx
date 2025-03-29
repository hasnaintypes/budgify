"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, formatDate, formatTimestamp } from "@/lib/utils";
import type { DateRange } from "@/components/ui/date-range-picker";
import { useCategories } from "@/hooks/use-categories";
import { useUser } from "@clerk/clerk-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionTableProps {
  dateRange: DateRange;
}

export function TransactionTable({ dateRange }: TransactionTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const itemsPerPage = 5; // Reduced for better spacing

  const { user } = useUser();
  const { data, isLoading } = useTransactions({
    clerkId: user?.id as string,
  });

  console.log(data);

  const { categories } = useCategories();

  // Filter transactions
  const filteredTransactions = data?.filter((transaction) => {
    // Date range filter
    const transactionDate = new Date(Number(transaction.date));
    transactionDate.setHours(0, 0, 0, 0); // Reset time to midnight

    const fromDate = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
    const toDate = dateRange.to ? new Date(dateRange.to.setHours(0, 0, 0, 0)) : null;

    const isInDateRange =
      (!fromDate || transactionDate >= fromDate) &&
      (!toDate || transactionDate <= toDate);

    // Search filter
    const matchesSearch =
      search === "" ||
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.categoryName.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || transaction.categoryName === categoryFilter;

    // Type filter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    return isInDateRange && matchesSearch && matchesCategory && matchesType;
  });

  // Pagination
  const totalPages = filteredTransactions
    ? Math.ceil(filteredTransactions.length / itemsPerPage)
    : 0;
  const paginatedTransactions = filteredTransactions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, typeFilter, dateRange]);

  // Export transactions as CSV
  const exportToCSV = () => {
    // if (!filteredTransactions || filteredTransactions.length === 0) return;
    // const headers = ["Date", "Description", "Category", "Type", "Amount"];
    // const csvData = filteredTransactions.map((t) => [
    //   formatTimestamp(t.date),
    //   t.description,
    //   t.categoryName,
    //   t.type,
    //   t.amount.toString(),
    // ]);
    // const csvContent = [
    //   headers.join(","),
    //   ...csvData.map((row) => row.join(",")),
    // ].join("\n");
    // const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement("a");
    // link.setAttribute("href", url);
    // link.setAttribute(
    //   "download",
    //   `transactions_${formatTimestamp(dateRange.from)}_to_${formatTimestamp(dateRange.to)}.csv`
    // );
    // link.style.visibility = "hidden";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8 w-full sm:w-[250px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category.name}>
                  <div className="flex items-center">
                    {/* <span className="mr-2">{category.icon}</span> */}
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {paginatedTransactions && paginatedTransactions.length > 0 ? (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
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
                            {formatTimestamp(transaction.date)}
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
                        {transaction.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatTimestamp(transaction.date)}
                    </TableCell>
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
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredTransactions?.length || 0
                )}{" "}
                of {filteredTransactions?.length || 0}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-[200px] items-center justify-center border rounded-md">
          <div className="text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
