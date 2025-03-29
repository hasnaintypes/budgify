import { Greeting } from "@/components/dashboard/greeting";
import { Overview } from "@/components/dashboard/overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { AccountsSection } from "@/components/dashboard/accounts-section";
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Greeting />
      <Overview />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTransactions />
        <CategoryBreakdown />
      </div>
      <AccountsSection />
      <TransactionHistory />
    </div>
  );
}
