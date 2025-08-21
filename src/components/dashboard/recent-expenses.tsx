"use client";

import Papa from "papaparse";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const cardHoverEffect =
  "transition-all duration-200 hover:shadow-xl hover:-translate-y-1";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  const recentExpenses = expenses.slice(0, 5);
  const { toast } = useToast();

  const handleExport = () => {
    if (expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There are no expenses to export.",
      });
      return;
    }

    const dataToExport = expenses.map((e) => ({
      Date: new Date(e.date).toLocaleDateString(),
      Category: e.category,
      Amount: e.amount,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Your expenses have been downloaded as a CSV file.",
    });
  };

  return (
    <Card className={cn("h-full flex flex-col", cardHoverEffect)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last 5 expenses.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        {recentExpenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No expenses recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
