"use client";

import { memo, useMemo, useCallback, useState } from "react";
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
import {
  useAccounts,
  type Account,
  type AccountFormData,
} from "@/hooks/use-accounts";
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
import { useToast } from "@/hooks/use-toast";

type IconName = keyof typeof LucideIcons;

interface AccountsSectionProps {
  className?: string;
}

export const AccountsSection = memo<AccountsSectionProps>(
  function AccountsSection({ className }) {
    const { toast } = useToast();
    const { accounts, isLoading, addAccount, setActiveAccount, deleteAccount } =
      useAccounts();
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const isMobile = useIsMobile();
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(
      null
    );

    const [newAccount, setNewAccount] = useState<AccountFormData>({
      name: "",
      description: "",
      balance: 0,
      isActive: false,
      currency: "USD",
      color: "#3b82f6",
      icon: "Wallet",
    });

    // Memoize expensive calculations
    const accountsWithStats = useMemo(() => {
      return accounts.map((account) => ({
        ...account,
        formattedBalance: formatCurrency(account.balance),
        isOverLimit: account.balance < 0,
      }));
    }, [accounts]);

    const canCreateAccount = useMemo(
      () => accounts.length < 2,
      [accounts.length]
    );

    // Memoize event handlers
    const handleToggleActive = useCallback(
      async (account: Account) => {
        if (account.isActive) {
          toast({
            title: "Cannot deactivate",
            description: "You must have at least one active account",
            variant: "destructive",
          });
          return;
        }

        try {
          await setActiveAccount(account._id);
          toast({
            title: "Account Updated",
            description: `${account.name} is now your active account`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update account",
            variant: "destructive",
          });
        }
      },
      [setActiveAccount, toast]
    );

    const handleCreateAccount = useCallback(async () => {
      if (accounts.length >= 2) {
        toast({
          title: "Account Limit Reached",
          description: "You can only create up to 2 accounts",
          variant: "destructive",
        });
        return;
      }

      if (!newAccount.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Account name is required",
          variant: "destructive",
        });
        return;
      }

      try {
        await addAccount(newAccount);
        toast({
          title: "Account Created",
          description: `Successfully added ${newAccount.name}`,
        });

        // Reset form
        setNewAccount({
          name: "",
          description: "",
          balance: 0,
          isActive: false,
          currency: "USD",
          color: "#3b82f6",
          icon: "Wallet",
        });

        setIsCreateSheetOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
      }
    }, [accounts.length, addAccount, toast, newAccount]);

    const renderAccountIcon = useCallback((iconName: string) => {
      const IconComponent =
        (LucideIcons[iconName as IconName] as LucideIcons.LucideIcon) ||
        LucideIcons.Wallet;
      return IconComponent ? (
        <IconComponent className="h-6 w-6" />
      ) : (
        <Wallet className="h-6 w-6" />
      );
    }, []);

    const handleDeleteAccount = useCallback(async () => {
      if (accountToDelete) {
        try {
          await deleteAccount(accountToDelete._id);
          toast({
            title: "Account Deleted",
            description: `Successfully deleted ${accountToDelete.name}`,
          });
          setAccountToDelete(null);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete account",
            variant: "destructive",
          });
        }
      }
    }, [accountToDelete, deleteAccount, toast]);

    return (
      <Card className={`shadow-sm ${className || ""}`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-6">
          <div>
            <CardTitle className="text-xl">Accounts</CardTitle>
            <CardDescription>
              Manage your financial accounts ({accounts.length}/2)
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreateSheetOpen(true)}
            className="w-full sm:w-auto"
            disabled={!canCreateAccount}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {isLoading ? (
            <div className="flex gap-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] flex-1 rounded-lg" />
              ))}
            </div>
          ) : accounts.length > 0 ? (
            <div className="flex gap-6">
              {accounts.map((account) => (
                <Card
                  key={account._id}
                  className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg flex-1 ${
                    account.isActive
                      ? "ring-2 ring-primary shadow-md"
                      : "hover:shadow-md"
                  }`}
                >
                  {/* Color Accent Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: account.color }}
                  />

                  <CardContent className="p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm"
                          style={{ backgroundColor: account.color }}
                        >
                          {renderAccountIcon(account.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate">
                            {account.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {account.description || "No description"}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-60 hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Account options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/account/${account._id}`}>
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
                    </div>

                    {/* Balance Section */}
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {formatCurrency(account.balance)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {account.currency} • Current Balance
                      </div>
                    </div>

                    {/* Active Account Switch */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            account.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {account.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={() => handleToggleActive(account)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Account Placeholder (when only 1 account exists) */}
              {accounts.length === 1 && canCreateAccount && (
                <Card className="flex-1 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                        <PlusIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add another account
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateSheetOpen(true)}
                      >
                        Create Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No accounts yet
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first account to start tracking your finances
                </p>
                <Button onClick={() => setIsCreateSheetOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Account
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
                {!canCreateAccount && (
                  <span className="block mt-2 text-destructive font-medium">
                    Account limit reached (2/2). Delete an account to create a
                    new one.
                  </span>
                )}
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
                  disabled={!canCreateAccount}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accountDescription">Description</Label>
                <Textarea
                  id="accountDescription"
                  placeholder="Brief description of this account"
                  value={newAccount.description || ""}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      description: e.target.value,
                    })
                  }
                  className="resize-none"
                  rows={3}
                  disabled={!canCreateAccount}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountBalance">Starting Balance</Label>
                  <Input
                    id="accountBalance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAccount.balance || ""}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={!canCreateAccount}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountCurrency">Currency</Label>
                  <Select
                    value={newAccount.currency}
                    onValueChange={(value: string) =>
                      setNewAccount({ ...newAccount, currency: value })
                    }
                    disabled={!canCreateAccount}
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
                    onIconSelect={(icon: string) =>
                      setNewAccount({ ...newAccount, icon })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker
                    selectedColor={newAccount.color || "#3b82f6"}
                    onColorSelect={(color: string) =>
                      setNewAccount({ ...newAccount, color })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="accountActive"
                  checked={newAccount.isActive}
                  onCheckedChange={(checked: boolean) =>
                    setNewAccount({ ...newAccount, isActive: checked })
                  }
                  disabled={!canCreateAccount}
                />
                <Label htmlFor="accountActive">
                  Make this my active account
                </Label>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAccount}
                disabled={!canCreateAccount}
              >
                Create Account
              </Button>
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
                This will permanently delete the account "
                {accountToDelete?.name}" and all its data. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
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
);
