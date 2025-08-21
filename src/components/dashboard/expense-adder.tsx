
"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileText, Loader2, Mic, StopCircle, Bot } from "lucide-react";

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
import { processVoiceInput, processAudioInput } from "@/app/actions";
import type { Expense } from "@/lib/types";
import { cn } from "@/lib/utils";


const manualFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  category: z.string().min(1, "Please select a category."),
});

const textCommandFormSchema = z.object({
  prompt: z.string().min(10, "Please provide a more detailed description."),
});

const categories = ["Food", "Travel", "Shopping", "Entertainment", "Bills", "Other"];
const cardHoverEffect = "transition-all duration-200 hover:shadow-xl hover:-translate-y-1";

export function ExpenseAdder({ onAddExpense }: { onAddExpense: (expense: Omit<Expense, "id" | "date">) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);


  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: { amount: '' as any, category: "" },
  });

  const textCommandForm = useForm<z.infer<typeof textCommandFormSchema>>({
    resolver: zodResolver(textCommandFormSchema),
    defaultValues: { prompt: "" },
  });

  function onManualSubmit(values: z.infer<typeof manualFormSchema>) {
    onAddExpense(values);
    toast({ title: "Expense Added", description: `₹${values.amount} for ${values.category} has been recorded.` });
    manualForm.reset();
  }

  function onTextCommandSubmit(values: z.infer<typeof textCommandFormSchema>) {
    startTransition(async () => {
      const result = await processVoiceInput(values.prompt);
      if (result.success && result.data) {
        onAddExpense(result.data);
        toast({ title: "Expense Added via Text Command", description: `₹${result.data.amount} for ${result.data.category} has been recorded.` });
        textCommandForm.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not understand the expense from your input.",
        });
      }
    });
  }
  
  const stopRecordingAndProcess = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    
    setIsRecording(false);
    toast({ title: "Recording Stopped", description: "Processing your expense..." });
  }, [toast]);
  

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        handleStopRecording();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
         if (audioBlob.size === 0) {
            toast({ variant: 'destructive', title: 'No audio detected', description: 'Please try speaking again.' });
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          startTransition(async () => {
            const result = await processAudioInput(base64Audio);
             if (result.success && result.data) {
                onAddExpense(result.data);
                toast({ title: "Expense Added via Voice", description: `₹${result.data.amount} for ${result.data.category} has been recorded.` });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Could not process your voice command.",
                });
            }
          });
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Speak your expense now. Recording will stop automatically after a pause." });
      
      // Silence detection
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const checkForSilence = () => {
          if (!isRecording) return;

          analyserRef.current!.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
              sum += Math.abs(dataArray[i] - 128);
          }
          const avg = sum / dataArray.length;

          if (avg < 3) { // Threshold for silence
              if (!silenceTimerRef.current) {
                  silenceTimerRef.current = setTimeout(() => {
                      stopRecordingAndProcess();
                  }, 2000); // 2 seconds of silence
              }
          } else {
              if (silenceTimerRef.current) {
                  clearTimeout(silenceTimerRef.current);
                  silenceTimerRef.current = null;
              }
          }
          requestAnimationFrame(checkForSilence);
      };
      checkForSilence();


    } catch (err) {
      toast({ variant: "destructive", title: "Microphone Error", description: "Could not access microphone." });
      console.error("Microphone access denied:", err);
    }
  };


  return (
    <Card className={cn("h-full", cardHoverEffect)}>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
        <CardDescription>Record a new transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voice">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voice">Voice Command</TabsTrigger>
            <TabsTrigger value="text">Text Command</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voice">
             <div className="pt-4 space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                    {isRecording ? "Recording your expense..." : "Press the button and speak to record an expense."}
                </p>
                <Button 
                    onClick={isRecording ? stopRecordingAndProcess : handleStartRecording} 
                    disabled={isPending}
                    size="icon"
                    className={cn("w-24 h-24 rounded-full", isRecording && "bg-destructive hover:bg-destructive/90")}
                >
                    {isPending ? <Loader2 className="h-10 w-10 animate-spin" /> : (isRecording ? <StopCircle className="h-10 w-10" /> : <Mic className="h-10 w-10" />)}
                </Button>
                {isRecording && <p className="text-xs text-primary animate-pulse">Listening...</p>}
             </div>
          </TabsContent>

          <TabsContent value="text">
            <Form {...textCommandForm}>
              <form onSubmit={textCommandForm.handleSubmit(onTextCommandSubmit)} className="space-y-4 pt-4">
                <FormField control={textCommandForm.control} name="prompt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe your expense</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Type a command like 'I spent 500 rupees on groceries' or 'Travel, 250 for the train ticket'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  Process Command
                </Button>
              </form>
            </Form>
          </TabsContent>

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
        </Tabs>
      </CardContent>
    </Card>
  );
}
