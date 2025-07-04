"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Trash2,
  Calendar,
  RefreshCw,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import {
  useRecurringTransactions,
  type RecurringTransaction,
} from "@/hooks/use-recurring-transactions";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatTimestamp } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function RecurringTransactionsSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] =
    useState<RecurringTransaction | null>(null);

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const {
    recurringTransactions,
    isLoading,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
    deleteRecurringTransaction,
  } = useRecurringTransactions(userData?._id || null);

  const handleToggleActive = async (transaction: RecurringTransaction) => {
    try {
      if (transaction.isActive) {
        await pauseRecurringTransaction({ recurringId: transaction._id });
        toast({
          title: "Recurring transaction paused",
          description: `${transaction.description} has been paused`,
        });
      } else {
        await resumeRecurringTransaction({ recurringId: transaction._id });
        toast({
          title: "Recurring transaction resumed",
          description: `${transaction.description} has been resumed`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recurring transaction",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (transaction: RecurringTransaction) => {
    try {
      await deleteRecurringTransaction({ recurringId: transaction._id });
      toast({
        title: "Recurring transaction deleted",
        description: `${transaction.description} has been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recurring transaction",
        variant: "destructive",
      });
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "YEARLY":
        return "Yearly";
      default:
        return frequency;
    }
  };

  const getNextDueText = (nextDueDate: number) => {
    const now = Date.now();
    const timeDiff = nextDueDate - now;

    if (timeDiff < 0) {
      return "Overdue";
    }

    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Due today";
    } else if (days === 1) {
      return "Due tomorrow";
    } else if (days <= 7) {
      return `Due in ${days} days`;
    } else {
      return formatTimestamp(nextDueDate);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Transactions</CardTitle>
          <CardDescription>
            Manage your automated recurring transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recurring Transactions
          </CardTitle>
          <CardDescription>
            Manage your automated recurring transactions
          </CardDescription>
        </div>
        <Badge variant="outline">
          {recurringTransactions?.length || 0} total
        </Badge>
      </CardHeader>
      <CardContent>
        {!recurringTransactions || recurringTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              No recurring transactions yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create a transaction and enable the recurring option to get
              started
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Frequency
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Next Due
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringTransactions.map((transaction) => (
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
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {getFrequencyLabel(transaction.frequency)} •{" "}
                            {getNextDueText(transaction.nextDueDate)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {transaction.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getFrequencyLabel(transaction.frequency)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className={
                          transaction.nextDueDate < Date.now()
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }
                      >
                        {getNextDueText(transaction.nextDueDate)}
                      </span>
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
                    <TableCell>
                      <Switch
                        checked={transaction.isActive}
                        onCheckedChange={() => handleToggleActive(transaction)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(transaction)}
                          >
                            {transaction.isActive ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </>
                            )}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete recurring transaction?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the recurring
                                  transaction "{transaction.description}". This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
