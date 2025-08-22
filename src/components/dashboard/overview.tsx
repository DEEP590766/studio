
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import type { Expense } from "@/lib/types";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

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
  const { profile } = useProfile();

  const { totalMonthlyExpense, categoryData, weeklyAverage, previousWeeklyAverage, savingRate } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth && expenseDate <= endOfToday;
    });

    const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    let rate = null;
    if (profile.monthlyIncome && profile.monthlyIncome > 0) {
        const savings = profile.monthlyIncome - total;
        rate = (savings / profile.monthlyIncome) * 100;
    }

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

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);

    const last7DaysExpenses = expenses.filter(e => new Date(e.date) > oneWeekAgo);
    const previous7DaysExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate > twoWeeksAgo && expenseDate <= oneWeekAgo;
    });

    const last7DaysTotal = last7DaysExpenses.reduce((sum, e) => sum + e.amount, 0);
    const previous7DaysTotal = previous7DaysExpenses.reduce((sum, e) => sum + e.amount, 0);

    const avg1 = last7DaysExpenses.length > 0 ? last7DaysTotal / 7 : 0;
    const avg2 = previous7DaysExpenses.length > 0 ? previous7DaysTotal / 7 : 0;
      
    return { 
        totalMonthlyExpense: total, 
        categoryData: data,
        weeklyAverage: avg1,
        previousWeeklyAverage: avg2,
        savingRate: rate,
    };
  }, [expenses, profile.monthlyIncome]);
  
  const weeklyChange = previousWeeklyAverage > 0 
    ? ((weeklyAverage - previousWeeklyAverage) / previousWeeklyAverage) * 100
    : weeklyAverage > 0 ? 100 : 0;

  const ChangeIcon = weeklyChange > 0 ? TrendingDown : TrendingUp;
  const changeColor = weeklyChange > 0 ? "text-destructive" : "text-green-500";
  
  const cardHoverEffect = "transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-accent";

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className={cn(cardHoverEffect, "lg:col-span-1")}>
        <CardHeader>
          <CardTitle>Total Expenses (This Month)</CardTitle>
           <CardDescription>Your total spending for the current month.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(totalMonthlyExpense)}
          </p>
        </CardContent>
      </Card>
      <Card className={cn(cardHoverEffect, "lg:col-span-1")}>
        <CardHeader>
            <CardTitle>7-Day Average Spend</CardTitle>
            <CardDescription>Your average daily spend over the last week.</CardDescription>
        </CardHeader>
        <CardContent>
              <p className="text-4xl font-bold text-primary">
                {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                }).format(weeklyAverage)}
            </p>
            {previousWeeklyAverage > 0 && (
                <div className={`text-xs flex items-center ${changeColor}`}>
                    <ChangeIcon className="w-4 h-4 mr-1" />
                    <span>{weeklyChange.toFixed(2)}% from previous week</span>
                </div>
            )}
        </CardContent>
      </Card>
       <Card className={cn(cardHoverEffect, "lg:col-span-1")}>
        <CardHeader>
            <CardTitle>Saving Rate</CardTitle>
            <CardDescription>The percentage of income you're saving.</CardDescription>
        </CardHeader>
        <CardContent>
            {savingRate !== null ? (
                <>
                 <p className={cn("text-4xl font-bold", savingRate >= 20 ? 'text-green-500' : savingRate >= 10 ? 'text-yellow-500' : 'text-destructive')}>
                    {savingRate.toFixed(1)}<span className="text-2xl">%</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on a monthly income of {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(profile.monthlyIncome || 0)}
                  </p>
                </>
            ) : (
                <div className="text-center text-muted-foreground pt-4">
                  <Percent className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Set your monthly income in your profile to see your saving rate.</p>
                </div>
            )}
        </CardContent>
      </Card>
      <Card className={cn(cardHoverEffect, "md:col-span-2 lg:col-span-1 flex flex-col")}>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
           <CardDescription>Spending distribution for this month.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {categoryData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[150px]">
                <PieChart>
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    strokeWidth={2}
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
                </ChartContainer>
                <div className="flex flex-col justify-center space-y-2">
                    {categoryData.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                                <span>{entry.name}</span>
                            </div>
                            <span className="font-medium">
                                {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                                }).format(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No expenses this month.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
