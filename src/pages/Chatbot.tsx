import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGuestData } from "@/hooks/useGuestData";
import { sendMessageToN8N } from "@/lib/n8nWebhook";
import ChatMessage, { Message } from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import QuickSuggestions from "@/components/chat/QuickSuggestions";

const DEFAULT_SUGGESTIONS = [
  "Room service menu",
  "Book a spa appointment",
  "Restaurant hours",
  "Request housekeeping",
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your personal AI concierge. How may I assist you today? You can ask me about hotel services, dining options, local attractions, or anything else you need.",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const guestData = useGuestData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    setHasError(false);
    setLastFailedMessage(null);

    const userMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendMessageToN8N(text, guestData);

      const botResponse: Message = {
        id: Date.now() + 1,
        text: response.reply,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Update suggestions if provided by n8n
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setHasError(true);
      setLastFailedMessage(text);

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Failed to reach the assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      // Remove the last error message
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastFailedMessage);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  const showQuickSuggestions = messages.length <= 2 && !isTyping;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] lg:min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-border bg-card"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-foreground">AI Concierge</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online & ready to help
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        {hasError && lastFailedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {showQuickSuggestions && (
        <QuickSuggestions
          suggestions={suggestions}
          onSelect={handleQuickSuggestion}
        />
      )}

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={() => handleSend()}
        disabled={isTyping}
      />
    </div>
  );
};

export default Chatbot;
