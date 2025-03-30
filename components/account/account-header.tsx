"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Wallet,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IconPicker } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";
import { useAccounts, type Account } from "@/hooks/use-accounts";
import { useAccountTransactions } from "@/hooks/use-account-transactions";
import { formatCurrency } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { useAuth } from "@clerk/nextjs";

type IconName = keyof typeof LucideIcons;
type Period = "current" | "previous" | "last3" | "last6" | "year" | "all";

export function AccountHeader({ account }: { account: Account }) {
  const { userId } = useAuth();
  const { updateAccount } = useAccounts();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedAccount, setEditedAccount] = useState<Account>(account);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("current");

  // Use our custom hook to get transaction data
  const { income, expenses, isLoading } = useAccountTransactions({
    clerkId: userId || "",
    accountId: account.id,
    period: selectedPeriod,
  });

  let currentBalance = income - expenses;

  const handleEditAccount = () => {
    updateAccount(account.id, editedAccount);
    setIsEditDialogOpen(false);
  };

  const renderAccountIcon = (iconName: string) => {
    const IconComponent =
      (LucideIcons[iconName as IconName] as LucideIcons.LucideIcon) ||
      LucideIcons.Wallet;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Account</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            defaultValue="current"
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as Period)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Current Balance
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(currentBalance)}
                </p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: account.color }}
              >
                {renderAccountIcon(account.icon)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedPeriod === "current"
                    ? "Income This Month"
                    : selectedPeriod === "previous"
                      ? "Income Last Month"
                      : selectedPeriod === "year"
                        ? "Income This Year"
                        : selectedPeriod === "all"
                          ? "All-Time Income"
                          : `Income (${selectedPeriod === "last3" ? "3" : "6"} months)`}
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {isLoading ? "Loading..." : formatCurrency(income)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <ArrowUpIcon className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-rose-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedPeriod === "current"
                    ? "Expenses This Month"
                    : selectedPeriod === "previous"
                      ? "Expenses Last Month"
                      : selectedPeriod === "year"
                        ? "Expenses This Year"
                        : selectedPeriod === "all"
                          ? "All-Time Expenses"
                          : `Expenses (${selectedPeriod === "last3" ? "3" : "6"} months)`}
                </p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {isLoading ? "Loading..." : formatCurrency(expenses)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
                <ArrowDownIcon className="h-6 w-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update your account details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={editedAccount.name}
                onChange={(e) =>
                  setEditedAccount({ ...editedAccount, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountDescription">Description</Label>
              <Textarea
                id="accountDescription"
                value={editedAccount.description}
                onChange={(e) =>
                  setEditedAccount({
                    ...editedAccount,
                    description: e.target.value,
                  })
                }
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountBalance">Balance</Label>
                <Input
                  id="accountBalance"
                  type="number"
                  value={editedAccount.balance}
                  onChange={(e) =>
                    setEditedAccount({
                      ...editedAccount,
                      balance: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountCurrency">Currency</Label>
                <Select
                  value={editedAccount.currency}
                  onValueChange={(value) =>
                    setEditedAccount({ ...editedAccount, currency: value })
                  }
                >
                  <SelectTrigger id="accountCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker
                  selectedIcon={editedAccount.icon as IconName}
                  onIconSelect={(icon) =>
                    setEditedAccount({ ...editedAccount, icon })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <ColorPicker
                  selectedColor={editedAccount.color}
                  onColorSelect={(color) =>
                    setEditedAccount({ ...editedAccount, color })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="accountActive"
                checked={editedAccount.isActive}
                onCheckedChange={(checked) =>
                  setEditedAccount({ ...editedAccount, isActive: checked })
                }
              />
              <Label htmlFor="accountActive">Set as active account</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditAccount}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
