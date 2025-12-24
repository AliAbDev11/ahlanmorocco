import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "processing";

interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ base64: string; format: string; duration: number } | null>;
  cancelRecording: () => void;
  error: string | null;
  clearError: () => void;
}

const MAX_DURATION_SECONDS = 120; // 2 minutes

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearError = useCallback(() => setError(null), []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecordingDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Voice messages are not supported in this browser. Please use Chrome, Firefox, or Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      setRecordingState("recording");

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
        
        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION_SECONDS) {
          mediaRecorder.stop();
        }
      }, 1000);

    } catch (err) {
      console.error("Recording error:", err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Microphone access is required to send voice messages. Please enable it in your browser settings.");
      } else {
        setError("Failed to record audio. Please try again.");
      }
      cleanup();
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<{ base64: string; format: string; duration: number } | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || recordingState !== "recording") {
        resolve(null);
        return;
      }

      setRecordingState("processing");
      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      mediaRecorder.onstop = async () => {
        try {
          const mimeType = mediaRecorder.mimeType;
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Check file size (5MB limit)
          if (audioBlob.size > 5 * 1024 * 1024) {
            setError("Voice message is too long. Please keep it under 2 minutes.");
            cleanup();
            setRecordingState("idle");
            resolve(null);
            return;
          }

          const base64 = await blobToBase64(audioBlob);
          const format = mimeType.includes('webm') ? 'webm' : 'mp4';
          
          cleanup();
          setRecordingState("idle");
          
          resolve({ base64, format, duration: finalDuration });
        } catch (err) {
          console.error("Error processing audio:", err);
          setError("Failed to process audio. Please try again.");
          cleanup();
          setRecordingState("idle");
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, [recordingState, cleanup]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setRecordingState("idle");
  }, [recordingState, cleanup]);

  return {
    recordingState,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    clearError,
  };
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
