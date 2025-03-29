"use client";

import { useParams } from "next/navigation";
import { useAccount } from "@/hooks/use-account";
import { AccountHeader } from "@/components/account/account-header";
import { BudgetOverview } from "@/components/account/budget-overview";
import { AccountTransactions } from "@/components/account/account-transactions";
import { BudgetManagement } from "@/components/account/budget-management";
import { SpendingAnalysis } from "@/components/account/spending-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountPage() {
  const { id } = useParams<{ id: string }>();
  const { account, isLoading } = useAccount(id as string);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] w-full rounded-lg" />
          <Skeleton className="h-[350px] w-full rounded-lg" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Account not found</h2>
          <p className="text-muted-foreground mt-2">
            The account you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AccountHeader account={account} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BudgetOverview accountId={id as string} />
        <SpendingAnalysis accountId={id as string} />
      </div>

      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="budget">Budget Management</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="budget" className="mt-0">
          <BudgetManagement accountId={id as string} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-0">
          <AccountTransactions accountId={id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
