import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Process recurring transactions every hour
crons.interval(
  "process recurring transactions",
  { minutes: 60 }, // Every hour
  api.recurringTransactions.processDueRecurringTransactions
);

// Alternative: Process every 30 minutes for more frequent processing
// crons.interval(
//   "process recurring transactions",
//   { minutes: 30 },
//   api.recurringTransactions.processDueRecurringTransactions
// );

// Daily cleanup at midnight
crons.daily(
  "daily recurring transaction cleanup",
  { hourUTC: 0, minuteUTC: 0 }, // Midnight UTC
  api.recurringTransactions.processDueRecurringTransactions
);

export default crons;
