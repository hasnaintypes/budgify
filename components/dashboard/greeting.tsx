"use client";

import { useUser } from "@clerk/nextjs";
import { TransactionSheet } from "./transaction-sheet";
import { useState, useEffect } from "react";

export function Greeting() {
  const { user, isLoaded } = useUser();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 12 && hours < 18) setGreeting("Good afternoon");
    if (hours >= 18) setGreeting("Good evening");
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {isLoaded ? user?.firstName || "Guest" : "Loading..."}
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your expenses and manage your budget with ease.
        </p>
      </div>
      <TransactionSheet />
    </div>
  );
}
