import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "processing";

interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  recordingDuration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  resetState: () => void;
  isSupported: boolean;
}

const MAX_RECORDING_DURATION = 120; // 2 minutes in seconds

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const isSupported =
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecordingDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError(
        "Voice messages are not supported in this browser. Please use Chrome, Firefox, or Safari."
      );
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState("recording");
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= MAX_RECORDING_DURATION) {
          mediaRecorder.stop();
        }
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError(
          "Microphone access is required to send voice messages. Please enable it in your browser settings."
        );
      } else {
        setError("Failed to record audio. Please try again.");
      }
      cleanup();
      setRecordingState("idle");
    }
  }, [isSupported, cleanup]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || recordingState !== "recording") {
        resolve(null);
        return;
      }

      setRecordingState("processing");

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Check file size (5MB limit)
        if (audioBlob.size > 5 * 1024 * 1024) {
          setError(
            "Voice message is too long. Please keep it under 2 minutes."
          );
          cleanup();
          setRecordingState("idle");
          resolve(null);
          return;
        }

        cleanup();
        resolve(audioBlob);
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
    setError(null);
  }, [recordingState, cleanup]);

  const resetState = useCallback(() => {
    setRecordingState("idle");
    setError(null);
  }, []);

  return {
    recordingState,
    recordingDuration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
    isSupported,
  };
};
