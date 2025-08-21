"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isPending: boolean;
}

export function ChatInput({ onSendMessage, isPending }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !isPending) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your spending..."
        rows={1}
        className="flex-1 resize-none"
        disabled={isPending}
      />
      <Button onClick={handleSend} disabled={isPending || !input.trim()} size="icon">
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        <span className="sr-only">Send Message</span>
      </Button>
    </div>
  );
}
