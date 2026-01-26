import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Mic } from "lucide-react";
import VoiceAssistantModal from "@/components/chat/VoiceAssistantModal";
import ahlanAssistantLogo from "@/assets/ahlan-assistant-logo.webp";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGuestData } from "@/hooks/useGuestData";
import { sendMessageToN8N, sendAudioToN8N } from "@/lib/n8nWebhook";
import ChatMessage, { Message } from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import QuickSuggestions from "@/components/chat/QuickSuggestions";

const Chatbot = () => {
  const { t } = useTranslation();
  
  const DEFAULT_SUGGESTIONS = [
    t("chatbot.suggestions.hotelServices"),
    t("chatbot.suggestions.localTips"),
    t("chatbot.suggestions.bookSpa"),
    t("chatbot.suggestions.restaurant"),
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your personal AI assistant. How may I assist you today? You can ask me about hotel services, dining options, local attractions.",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [lastFailedAudio, setLastFailedAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
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
    setLastFailedAudio(null);

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

  const handleSendAudio = async (audioBlob: Blob, duration: number) => {
    setHasError(false);
    setLastFailedMessage(null);
    setLastFailedAudio(null);

    // Create audio URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);

    const userMessage: Message = {
      id: Date.now(),
      text: "",
      isBot: false,
      timestamp: new Date(),
      isAudio: true,
      audioUrl,
      audioDuration: duration,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendAudioToN8N(audioBlob, duration, guestData);

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
      console.error("Audio send error:", error);
      setHasError(true);
      setLastFailedAudio({ blob: audioBlob, duration });

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble sending your voice message. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Failed to send voice message. Please try again.",
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
    } else if (lastFailedAudio) {
      // Remove the last error message
      setMessages((prev) => prev.slice(0, -1));
      handleSendAudio(lastFailedAudio.blob, lastFailedAudio.duration);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  const showQuickSuggestions = messages.length <= 2 && !isTyping;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen overflow-hidden">
      {/* Header - Fixed at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 p-6 border-b border-border bg-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <img src={ahlanAssistantLogo} alt="AI Assistant" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-foreground">{t("chatbot.title")}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t("chatbot.online")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 rounded-full"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </Button>
        </div>
      </motion.div>

      {/* Messages - Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        {hasError && (lastFailedMessage || lastFailedAudio) && (
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

      {/* Quick suggestions - Fixed above input */}
      {showQuickSuggestions && (
        <div className="flex-shrink-0">
          <QuickSuggestions
            suggestions={suggestions}
            onSelect={handleQuickSuggestion}
          />
        </div>
      )}

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => handleSend()}
          onSendAudio={handleSendAudio}
          disabled={isTyping}
        />
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        open={isVoiceModalOpen} 
        onOpenChange={setIsVoiceModalOpen} 
      />
    </div>
  );
};

export default Chatbot;
