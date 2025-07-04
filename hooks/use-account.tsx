"use client";

import { useState, useEffect } from "react";
import { useAccounts, type Account } from "@/hooks/use-accounts";

export function useAccount(id: string) {
  const { accounts, isLoading: isLoadingAccounts } = useAccounts();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Avoid unnecessary state updates
    if (!isLoadingAccounts) {
      const foundAccount = accounts.find((acc) => acc._id === id) || null;

      // Only update state if the value has changed
      setAccount((prevAccount) =>
        prevAccount?._id !== foundAccount?._id ? foundAccount : prevAccount
      );
      setIsLoading(false);
    }
  }, [id, accounts, isLoadingAccounts]);

  return { account, isLoading };
}
