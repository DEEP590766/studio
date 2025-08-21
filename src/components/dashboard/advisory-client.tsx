"use client";

import { useState, useTransition } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";

import { generateAndRevalidateFinanceTips } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/hooks/use-expenses";

export function AdvisoryClient() {
  const [advice, setAdvice] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { expenses, loading: expensesLoading } = useExpenses();

  const handleFetchAdvice = () => {
    startTransition(async () => {
      const recentExpenses = expenses.slice(0, 20); // Use recent 20 expenses for analysis
      const result = await generateAndRevalidateFinanceTips("Personalized Advice", recentExpenses);
      if (result.success && result.data) {
        setAdvice(result.data);
        toast({ title: "Personalized Advice Generated!", description: `Here is some advice based on your recent spending.` });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate new advice at this time.",
        });
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={handleFetchAdvice} disabled={isPending || expensesLoading}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
          {expensesLoading ? "Loading Expenses..." : "Analyze My Spending"}
        </Button>
      </div>

      <div className="space-y-4">
        {advice.length > 0 ? (
          advice.map((tip, index) => (
            <Card key={index} className="flex items-start p-4">
               <div className="flex-shrink-0 mr-4">
                 <div className="bg-primary/10 p-3 rounded-full">
                    <Sparkles className="h-6 w-6 text-primary" />
                 </div>
              </div>
              <CardContent className="p-0 pt-1">
                <p>{tip}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>Click the button to get personalized financial advice based on your spending.</p>
          </div>
        )}
      </div>
    </div>
  );
}
