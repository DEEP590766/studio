"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Loader2 } from "lucide-react";

import { generateAndRevalidateFinanceTips } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function FinanceTipsClient({ initialTips }: { initialTips: string[] }) {
  const [tips, setTips] = useState(initialTips);
  const [topic, setTopic] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFetchTips = () => {
    startTransition(async () => {
      const result = await generateAndRevalidateFinanceTips(topic);
      if (result.success && result.data) {
        setTips(result.data);
        toast({ title: "New Tips Generated!", description: `Here are some tips about ${topic || 'general finance'}.` });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate new tips at this time.",
        });
      }
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Get tips on a specific topic (e.g., investing, saving)..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button onClick={handleFetchTips} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generate Tips
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.length > 0 ? (
          tips.map((tip, index) => (
            <Card key={index} className="flex items-center p-4">
              <div className="flex-shrink-0 mr-4">
                 <div className="bg-primary/10 p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-primary" />
                 </div>
              </div>
              <CardContent className="p-0">
                <p>{tip}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            No tips available. Try generating some!
          </p>
        )}
      </div>
    </div>
  );
}
