
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Bot, Loader2, User, Send } from "lucide-react";
import { generateAndRevalidateFinanceTips, askLLMAboutExpenses } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/hooks/use-expenses";
import { ChatInput } from "./chat-input";
import { ChatMessage, Message } from "./chat-message";

export function AdvisoryClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { expenses, loading: expensesLoading } = useExpenses();
  const scrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInitialAnalysis = () => {
    startTransition(async () => {
        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: 'Analyze my recent spending and give me personalized advice.' };
        setMessages(prev => [...prev, userMessage]);

        const loadingMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: <Loader2 className="h-5 w-5 animate-spin" /> };
        setMessages(prev => [...prev, loadingMessage]);

        const recentExpenses = expenses.slice(0, 20);
        const result = await generateAndRevalidateFinanceTips("Personalized Advice", recentExpenses);
        
        if (result.success && result.data) {
            const adviceContent = (
                <ul className="list-disc space-y-2 pl-5">
                    {result.data.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
            );
            const assistantMessage: Message = { id: (Date.now() + 2).toString(), role: 'assistant', content: adviceContent };
            setMessages(prev => [...prev.slice(0, -1), assistantMessage]);
        } else {
            const errorMessage: Message = { id: (Date.now() + 2).toString(), role: 'assistant', content: "Sorry, I couldn't generate advice right now. Please try again later." };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    });
  }

  const handleSendMessage = (input: string) => {
    startTransition(async () => {
        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);

        const loadingMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: <Loader2 className="h-5 w-5 animate-spin" /> };
        setMessages(prev => [...prev, loadingMessage]);

        const recentExpenses = expenses.slice(0, 50); // Send up to 50 recent expenses for context
        const result = await askLLMAboutExpenses(input, recentExpenses);
        
        if (result.success && result.data) {
            const assistantMessage: Message = { id: (Date.now() + 2).toString(), role: 'assistant', content: result.data };
            setMessages(prev => [...prev.slice(0, -1), assistantMessage]);
        } else {
            const errorMessage: Message = { id: (Date.now() + 2).toString(), role: 'assistant', content: "Sorry, I couldn't answer your question right now. Please try again later." };
            setMessages(prev => [...prev.slice(0, -1), errorMessage]);
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-card border rounded-lg shadow-lg">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length > 0 ? (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Bot className="h-16 w-16 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">AI Spending Analysis</h2>
                    <p className="mb-4">I can analyze your spending, answer questions, and give you personalized tips.</p>
                    <Button onClick={handleInitialAnalysis} disabled={isPending || expensesLoading}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        {expensesLoading ? "Loading Expenses..." : "Analyze My Spending"}
                    </Button>
                </div>
            )}
        </div>
        <div className="p-4 border-t">
            <ChatInput onSendMessage={handleSendMessage} isPending={isPending} />
        </div>
    </div>
  );
}
