import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Mic, Square, X, Loader2 } from "lucide-react";
import { useAudioRecorder, RecordingState } from "@/hooks/useAudioRecorder";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendAudio: (audioData: { base64: string; format: string; duration: number }) => void;
  disabled: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ChatInput = ({ value, onChange, onSend, onSendAudio, disabled }: ChatInputProps) => {
  const { toast } = useToast();
  const {
    recordingState,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    clearError,
  } = useAudioRecorder();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Handle spacebar for recording on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body && recordingState === "idle" && !disabled) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = async (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body && recordingState === "recording") {
        e.preventDefault();
        const audioData = await stopRecording();
        if (audioData) {
          onSendAudio(audioData);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [recordingState, disabled, startRecording, stopRecording, onSendAudio]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Recording Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleMicClick = async () => {
    if (recordingState === "idle") {
      await startRecording();
    } else if (recordingState === "recording") {
      const audioData = await stopRecording();
      if (audioData) {
        onSendAudio(audioData);
      }
    }
  };

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";

  return (
    <div className="p-6 border-t border-border bg-card">
      {isRecording && (
        <div className="flex items-center justify-center gap-3 mb-4 text-destructive animate-pulse">
          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <span className="font-medium">Recording... {formatDuration(recordingDuration)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="h-8 px-2"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}
      
      <div className="flex gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isRecording ? "Recording voice message..." : "Type your message..."}
          className="flex-1 bg-secondary/50 border-border h-12"
          disabled={disabled || isRecording || isProcessing}
        />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleMicClick}
              disabled={disabled || isProcessing}
              className={`h-12 w-12 transition-all ${
                isRecording ? "animate-pulse" : ""
              }`}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? "Click to stop & send" : "Click to record voice message"}</p>
          </TooltipContent>
        </Tooltip>

        <Button
          variant="gold"
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || disabled || isRecording || isProcessing}
          className="h-12 w-12"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
