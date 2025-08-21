"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mic, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { processVoiceInput } from "@/app/actions";
import type { Expense } from "@/lib/types";

const manualFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  category: z.string().min(1, "Please select a category."),
});

const voiceFormSchema = z.object({
  prompt: z.string().min(10, "Please provide a more detailed description."),
});

const categories = ["Food", "Travel", "Shopping", "Entertainment", "Bills", "Other"];

export function ExpenseAdder({ onAddExpense }: { onAddExpense: (expense: Omit<Expense, "id" | "date">) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: { amount: '' as any, category: "" },
  });

  const voiceForm = useForm<z.infer<typeof voiceFormSchema>>({
    resolver: zodResolver(voiceFormSchema),
    defaultValues: { prompt: "" },
  });

  function onManualSubmit(values: z.infer<typeof manualFormSchema>) {
    onAddExpense(values);
    toast({ title: "Expense Added", description: `₹${values.amount} for ${values.category} has been recorded.` });
    manualForm.reset();
  }

  function onVoiceSubmit(values: z.infer<typeof voiceFormSchema>) {
    startTransition(async () => {
      const result = await processVoiceInput(values.prompt);
      if (result.success && result.data) {
        onAddExpense(result.data);
        toast({ title: "Expense Added via Voice", description: `₹${result.data.amount} for ${result.data.category} has been recorded.` });
        voiceForm.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not understand the expense from your input.",
        });
      }
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
        <CardDescription>Record a new transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4 pt-4">
                <FormField control={manualForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={manualForm.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="voice">
            <Form {...voiceForm}>
              <form onSubmit={voiceForm.handleSubmit(onVoiceSubmit)} className="space-y-4 pt-4">
                <FormField control={voiceForm.control} name="prompt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe your expense</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'Spent fifty rupees on coffee' or 'Travel, 250'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                  Process Input
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
