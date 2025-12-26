import { motion } from "framer-motion";
import { User, Mic, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ahlanAssistantLogo from "@/assets/ahlan-assistant-logo.webp";

export interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isAudio?: boolean;
  audioUrl?: string;
  audioDuration?: number;
}

interface ChatMessageProps {
  message: Message;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatMessageText = (text: string): React.ReactNode => {
  // Split by double newlines for paragraphs, or single newlines
  const lines = text.split(/\n+/);
  
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  
  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={`list-${elements.length}`} className={cn(
          "my-2 space-y-1",
          listType === 'ul' ? "list-disc pl-5" : "list-decimal pl-5"
        )}>
          {currentList.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">{item}</li>
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Check for bullet points (•, -, *, or emoji bullets)
    const bulletMatch = trimmedLine.match(/^[•\-\*]\s*(.+)$/);
    const emojiMatch = trimmedLine.match(/^(📱|🏨|🍽️|🌴|✨|🔔|📞|🛎️|💡|ℹ️|👉|✅|❌|⚠️|🎯|🔹|🔸|▪️|▫️)\s*(.+)$/);
    const numberedMatch = trimmedLine.match(/^(\d+)[.)\-]\s*(.+)$/);

    if (bulletMatch || emojiMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const content = bulletMatch ? bulletMatch[1] : (emojiMatch ? `${emojiMatch[1]} ${emojiMatch[2]}` : trimmedLine);
      currentList.push(content);
    } else if (numberedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(numberedMatch[2]);
    } else {
      flushList();
      elements.push(
        <p key={`p-${index}`} className="text-sm leading-relaxed mb-2 last:mb-0">
          {trimmedLine}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!audioRef.current || !message.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
    >
      <div className={`flex gap-3 max-w-[80%] ${message.isBot ? "" : "flex-row-reverse"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
            message.isBot ? "" : "bg-accent"
          }`}
        >
          {message.isBot ? (
            <img src={ahlanAssistantLogo} alt="AI Assistant" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-accent-foreground" />
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            message.isBot
              ? "bg-secondary text-foreground rounded-bl-md"
              : "bg-primary text-primary-foreground rounded-br-md"
          )}
        >
          {message.isAudio ? (
            <div className="flex items-center gap-3">
              {message.audioUrl && (
                <audio
                  ref={audioRef}
                  src={message.audioUrl}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayback}
                className={cn(
                  "h-8 w-8 rounded-full",
                  message.isBot
                    ? "hover:bg-primary/20 text-foreground"
                    : "hover:bg-primary-foreground/20 text-primary-foreground"
                )}
                disabled={!message.audioUrl}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="text-sm">
                  Voice message{" "}
                  {message.audioDuration !== undefined &&
                    `(${formatDuration(message.audioDuration)})`}
                </span>
              </div>
            </div>
          ) : (
            message.isBot ? formatMessageText(message.text) : (
              <p className="text-sm leading-relaxed">{message.text}</p>
            )
          )}
          <span className="text-xs opacity-60 mt-2 block">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
