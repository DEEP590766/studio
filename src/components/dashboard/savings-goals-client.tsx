
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Target, Calendar as CalendarIcon, PiggyBank } from "lucide-react";

import { useGoals } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { format, differenceInMonths, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";


const goalFormSchema = z.object({
  name: z.string().min(3, "Goal name must be at least 3 characters."),
  targetAmount: z.coerce.number().positive("Target amount must be positive."),
  targetDate: z.date({ required_error: "A target date is required." }),
});

const cardHoverEffect = "transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-primary";

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
  
  const getInvestmentSuggestion = (goal: Goal) => {
    const months = differenceInMonths(new Date(goal.targetDate), new Date());
    if (months <= 0) return "Target date has passed.";
    
    // Assuming currentAmount is already saved towards the goal from other sources.
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    if (remainingAmount <= 0) return "Goal achieved! Congratulations!";

    const monthlyContribution = remainingAmount / months;
    return `Save ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(monthlyContribution)}/month to reach your goal.`;
  };


  if (loading) {
    return <p>Loading goals...</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className={cn("flex flex-col", cardHoverEffect)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Target /> {goal.name}
                    </CardTitle>
                    <CardDescription>
                        {formatDistanceToNow(new Date(goal.targetDate), { addSuffix: true })}
                    </CardDescription>
                </div>
                <Badge variant={goal.currentAmount >= goal.targetAmount ? "default" : "secondary"}>
                    {(((goal.currentAmount / goal.targetAmount) * 100) || 0).toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(goal.currentAmount)}
                </span>
                <span>
                  Target: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(goal.targetAmount)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-primary font-semibold">{getInvestmentSuggestion(goal)}</p>
            </CardFooter>
          </Card>
        ))}
        
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Card className={cn("flex items-center justify-center border-dashed hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[260px]", cardHoverEffect)}>
              <div className="text-center p-4">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary" />
                <p className="mt-2 font-semibold">Add New Goal</p>
                <p className="text-sm text-muted-foreground mt-1">Set a new target to save towards.</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set a New Savings Goal</DialogTitle>
              <DialogDescription>What are you saving up for? We'll recommend a plan.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Goal Name</FormLabel><FormControl><Input placeholder="e.g., New Laptop, Vacation" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="targetAmount" render={({ field }) => (
                  <FormItem><FormLabel>Target Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="75000" {...field} /></FormControl><FormMessage /></FormItem>
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
       {goals.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-16 col-span-full">
            <PiggyBank className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold">No Goals Yet</h3>
            <p>You haven't set any savings goals.</p>
            <p>Click the "Add New Goal" card to get started!</p>
          </div>
        )}
    </div>
  );
}
