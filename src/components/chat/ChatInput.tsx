import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Mic, Square, X, Loader2 } from "lucide-react";
import { useAudioRecorder, RecordingState } from "@/hooks/useAudioRecorder";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendAudio: (audioBlob: Blob, duration: number) => Promise<void>;
  disabled: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const ChatInput = ({ value, onChange, onSend, onSendAudio, disabled }: ChatInputProps) => {
  const {
    recordingState,
    recordingDuration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
    isSupported,
  } = useAudioRecorder();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleMicClick = async () => {
    if (recordingState === "idle") {
      await startRecording();
    } else if (recordingState === "recording") {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        try {
          await onSendAudio(audioBlob, recordingDuration);
        } finally {
          // Always reset state after sending, whether success or error
          resetState();
        }
      } else {
        // If no blob was returned, reset state
        resetState();
      }
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      console.error("Audio recording error:", error);
    }
  }, [error]);

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";
  const isInputDisabled = disabled || isRecording || isProcessing;

  return (
    <div className="p-6 border-t border-border bg-card">
      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-3 flex items-center justify-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
          </span>
          <span className="text-destructive font-medium">Recording... {formatDuration(recordingDuration)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/20"
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
          placeholder={isRecording ? "Recording audio..." : "Type your message..."}
          className="flex-1 bg-secondary/50 border-border h-12"
          disabled={isInputDisabled}
        />
        
        {/* Microphone Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleMicClick}
              disabled={!isSupported || isProcessing || disabled}
              className={cn(
                "h-12 w-12 transition-all",
                isRecording && "animate-pulse",
                !isSupported && "opacity-50 cursor-not-allowed"
              )}
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
            {!isSupported ? (
              <p>Voice messages not supported in this browser</p>
            ) : isProcessing ? (
              <p>Sending audio...</p>
            ) : isRecording ? (
              <p>Click to stop and send</p>
            ) : (
              <p>Click to record voice message</p>
            )}
          </TooltipContent>
        </Tooltip>

        <Button
          variant="gold"
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || isInputDisabled}
          className="h-12 w-12"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
