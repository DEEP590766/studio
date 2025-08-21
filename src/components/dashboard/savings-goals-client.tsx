"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Target, Calendar as CalendarIcon } from "lucide-react";

import { useGoals } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";


const goalFormSchema = z.object({
  name: z.string().min(3, "Goal name must be at least 3 characters."),
  targetAmount: z.coerce.number().positive("Target amount must be positive."),
  targetDate: z.date({ required_error: "A target date is required." }),
});

export function SavingsGoalsClient() {
  const { goals, addGoal, loading } = useGoals();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: undefined,
    }
  });

  function onSubmit(values: z.infer<typeof goalFormSchema>) {
    addGoal({ ...values, targetDate: values.targetDate.toISOString() });
    toast({ title: "Goal Added!", description: `New goal "${values.name}" has been set.` });
    form.reset();
    setDialogOpen(false);
  }

  if (loading) {
    return <p>Loading goals...</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target /> {goal.name}
              </CardTitle>
              <CardDescription>
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="mb-2" />
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(goal.currentAmount)}
                </span>
                <span className="text-muted-foreground">
                  of {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(goal.targetAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Card className="flex items-center justify-center border-dashed hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[200px]">
              <div className="text-center">
                <PlusCircle className="mx-auto h-12 w-12" />
                <p className="mt-2 font-semibold">Add New Goal</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set a New Savings Goal</DialogTitle>
              <DialogDescription>What are you saving up for?</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Goal Name</FormLabel><FormControl><Input placeholder="e.g., New Laptop" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="targetAmount" render={({ field }) => (
                  <FormItem><FormLabel>Target Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="targetDate" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Target Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover>
                  <FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit">Set Goal</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      </div>
       {goals.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <p>You haven't set any goals yet.</p>
            <p>Click the card above to get started!</p>
          </div>
        )}
    </div>
  );
}
