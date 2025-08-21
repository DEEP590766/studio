"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: React.ReactNode;
}

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';
    return (
        <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <Avatar className="h-10 w-10 border">
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-[75%] rounded-lg p-3 text-sm",
                isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                {message.content}
            </div>
            {isUser && (
                 <Avatar className="h-10 w-10 border">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
