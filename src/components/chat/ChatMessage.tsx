import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

export interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
    >
      <div className={`flex gap-3 max-w-[80%] ${message.isBot ? "" : "flex-row-reverse"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.isBot ? "bg-primary" : "bg-accent"
          }`}
        >
          {message.isBot ? (
            <Bot className="w-4 h-4 text-primary-foreground" />
          ) : (
            <User className="w-4 h-4 text-accent-foreground" />
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 ${
            message.isBot
              ? "bg-secondary text-foreground rounded-bl-md"
              : "bg-primary text-primary-foreground rounded-br-md"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          <span className="text-xs opacity-60 mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
