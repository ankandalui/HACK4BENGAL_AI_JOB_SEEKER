"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BriefcaseIcon, SendIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  content: string;
  isUser: boolean;
}

export default function CareerGuide() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "Hello! I'm your Career Coach AI assistant. I can help with resume building, job searching, interview preparation, career transitions, skill development, and more. How can I assist with your career today?",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        { content: data.response, isUser: false },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          content: "Sorry, I encountered an error. Please try again later.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-72 flex-col bg-card border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">Career Coach AI</h1>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setInput("How can I improve my resume?")}
            >
              📄 Resume Optimization
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                setInput("I want to switch careers. What steps should I take?")
              }
            >
              🔄 Career Switching
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                setInput("What are some effective job search strategies?")
              }
            >
              🔍 Job Search Tips
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setInput("How can I prepare for a job interview?")}
            >
              💬 Interview Preparation
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                setInput(
                  "What skills should I develop to advance in my career?"
                )
              }
            >
              📚 Skill Development
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                setInput("How can I find and apply for remote jobs?")
              }
            >
              💻 Remote Work
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Card
                key={index}
                className={`p-4 max-w-[80%] ${
                  message.isUser
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto"
                }`}
              >
                {message.content}
              </Card>
            ))}
            {isLoading && (
              <Card className="p-4 max-w-[80%] mr-auto">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Thinking</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
        <div className="fixed bottom-0 left-0 w-full border-t bg-background px-4 py-3 z-50">
          <div className="w-full max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 w-full"
            >
              <Input
                className="flex-1 px-4 py-2 text-base"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your career..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="p-2">
                <SendIcon className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
