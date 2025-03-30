"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, MoreHorizontal, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts, type Account } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { IconPicker } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type IconName = keyof typeof LucideIcons;

export function AccountsSection() {
  const { accounts, isLoading, addAccount, setActiveAccount, deleteAccount } =
    useAccounts();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    name: "",
    description: "",
    balance: 0,
    isActive: true,
    currency: "USD",
    color: "#3b82f6",
    icon: "Wallet",
  });

  const renderAccountIcon = (iconName: string) => {
    const IconComponent =
      (LucideIcons[iconName as IconName] as LucideIcons.LucideIcon) ||
      LucideIcons.Wallet;
    return IconComponent ? (
      <IconComponent className="h-5 w-5" />
    ) : (
      <Wallet className="h-5 w-5" />
    );
  };

  const toggleAccountActive = (account: Account) => {
    if (!account.isActive) {
      setActiveAccount(account.id);
    }
  };

  const handleCreateAccount = () => {
    if (newAccount.name?.trim()) {
      addAccount(newAccount as Omit<Account, "id" | "createdAt" | "updatedAt">);

      // Reset form
      setNewAccount({
        name: "",
        description: "",
        balance: 0,
        isActive: true,
        currency: "USD",
        color: "#3b82f6",
        icon: "Wallet",
      });

      setIsCreateSheetOpen(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Accounts</CardTitle>
          <CardDescription>Manage your financial accounts</CardDescription>
        </div>
        <Button
          onClick={() => setIsCreateSheetOpen(true)}
          className="w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[140px] w-full rounded-lg" />
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className={`overflow-hidden transition-all ${
                  account.isActive
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:shadow-md"
                }`}
                style={{
                  borderLeftColor: account.color,
                  borderLeftWidth: "4px",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: account.color }}
                      >
                        {renderAccountIcon(account.icon)}
                      </div>
                      <div>
                        <h3 className="font-medium">{account.name}</h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {account.description}
                        </p>
                      </div>
                    </div>

                    <TooltipProvider>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Account menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Account options</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/account/${account.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setAccountToDelete(account)}
                          >
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </div>

                  <div className="mt-2">
                    <div className="text-2xl font-bold">
                      {formatCurrency(account.balance)}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        {account.isActive ? "Active Account" : "Inactive"}
                      </span>
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={() => toggleAccountActive(account)}
                        disabled={account.isActive}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-[140px] items-center justify-center border rounded-md">
            <div className="text-center">
              <p className="text-muted-foreground">No accounts yet</p>
              <Button
                variant="link"
                onClick={() => setIsCreateSheetOpen(true)}
                className="mt-2"
              >
                Create your first account
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Create Account Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "min-w-[400px]"}
        >
          <SheetHeader>
            <SheetTitle>Create New Account</SheetTitle>
            <SheetDescription>
              Add a new financial account to track your income and expenses.
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g., Personal, Business, Savings"
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountDescription">Description</Label>
              <Textarea
                id="accountDescription"
                placeholder="Brief description of this account"
                value={newAccount.description}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, description: e.target.value })
                }
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountBalance">Starting Balance</Label>
                <Input
                  id="accountBalance"
                  type="number"
                  placeholder="0.00"
                  value={newAccount.balance || ""}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      balance: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountCurrency">Currency</Label>
                <Select
                  value={newAccount.currency}
                  onValueChange={(value) =>
                    setNewAccount({ ...newAccount, currency: value })
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
                  selectedIcon={(newAccount.icon as IconName) || "Wallet"}
                  onIconSelect={(icon) =>
                    setNewAccount({ ...newAccount, icon })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <ColorPicker
                  selectedColor={newAccount.color || "#3b82f6"}
                  onColorSelect={(color) =>
                    setNewAccount({ ...newAccount, color })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="accountActive"
                checked={newAccount.isActive}
                onCheckedChange={(checked) =>
                  setNewAccount({ ...newAccount, isActive: checked })
                }
              />
              <Label htmlFor="accountActive">Set as active account</Label>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAccount}>Create Account</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Account Alert Dialog */}
      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account "{accountToDelete?.name}"
              and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (accountToDelete) {
                  deleteAccount(accountToDelete.id);
                  setAccountToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
