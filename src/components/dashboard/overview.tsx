"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Expense } from "@/lib/types";
import { useMemo } from "react";

const chartConfig = {
  expenses: {
    label: "Expenses",
  },
  food: {
    label: "Food",
    color: "hsl(var(--chart-1))",
  },
  travel: {
    label: "Travel",
    color: "hsl(var(--chart-2))",
  },
  shopping: {
    label: "Shopping",
    color: "hsl(var(--chart-3))",
  },
  entertainment: {
    label: "Entertainment",
    color: "hsl(var(--chart-4))",
  },
  bills: {
    label: "Bills",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

export function Overview({ expenses }: { expenses: Expense[] }) {
  const { totalMonthlyExpense, categoryData } = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    });

    const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const data = Object.keys(chartConfig)
      .filter(key => key !== 'expenses')
      .map(category => ({
        name: (chartConfig[category as keyof typeof chartConfig] as { label: string }).label,
        value: currentMonthExpenses
          .filter(e => e.category.toLowerCase() === category)
          .reduce((sum, e) => sum + e.amount, 0),
        fill: (chartConfig[category as keyof typeof chartConfig] as { color: string }).color,
      }))
      .filter(item => item.value > 0);
      
    return { totalMonthlyExpense: total, categoryData: data };
  }, [expenses]);
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(totalMonthlyExpense)}
          </p>
          <p className="text-xs text-muted-foreground">
            Your total spending for the current month.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No expenses this month to show chart.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
