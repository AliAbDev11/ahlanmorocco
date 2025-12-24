import { motion } from "framer-motion";
import { Bot, User, Mic, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isAudio?: boolean;
  audioDuration?: number;
  audioUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioPlayer = ({ audioUrl, duration }: { audioUrl?: string; duration?: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2">
      <Mic className="w-4 h-4 text-primary" />
      <span className="text-sm">Voice message ({formatDuration(duration || 0)})</span>
      {audioUrl && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayback}
            className="h-6 w-6 p-0"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
        </>
      )}
    </div>
  );
};

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
              : message.isAudio
              ? "bg-accent text-accent-foreground rounded-br-md"
              : "bg-primary text-primary-foreground rounded-br-md"
          }`}
        >
          {message.isAudio ? (
            <AudioPlayer audioUrl={message.audioUrl} duration={message.audioDuration} />
          ) : (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
          <span className="text-xs opacity-60 mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
