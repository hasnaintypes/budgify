import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";

export function useSummaryData() {
  const { user } = useUser();

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const userId = convexUser ? convexUser._id : null;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    total: 0,
    income: 0,
    expenses: 0,
  });

  const transactions = useQuery(api.transactions.getTransactionsByUser, {
    userId: userId!,
  });

  useEffect(() => {
    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      setData({
        total: income - expenses,
        income,
        expenses,
      });
      setIsLoading(false);
    }
  }, [transactions]);

  return { data, isLoading };
}
