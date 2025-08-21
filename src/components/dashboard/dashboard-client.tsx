"use client";

import { useExpenses } from "@/hooks/use-expenses";
import { Overview } from "./overview";
import { ExpenseAdder } from "./expense-adder";
import { RecentExpenses } from "./recent-expenses";
import type { Expense } from "@/lib/types";

export function DashboardClient() {
  const { expenses, addExpense, loading } = useExpenses();

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <Overview expenses={expenses} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpenseAdder onAddExpense={addExpense} />
        </div>
        <div className="lg:col-span-2">
          <RecentExpenses expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
