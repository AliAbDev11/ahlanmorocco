import { GuestData } from "@/hooks/useGuestData";

const N8N_WEBHOOK_URL = "https://arkx.app.n8n.cloud/webhook-test/Ahlan-Assistant";
const TIMEOUT_MS = 30000;

export interface N8NResponse {
  reply: string;
  suggestions?: string[];
}

export const sendMessageToN8N = async (
  messageText: string,
  guestData: GuestData | null
  console.log(guestData);
): Promise<N8NResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        message: messageText,
        guest_id: guestData?.id,
        guest_name: guestData?.full_name,
        room_number: guestData?.room_number,
        phone_number: guestData?.phone_number,
        timestamp: new Date().toISOString(),
        message_type: "text",
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    const botResponse = await response.json();
    
    return {
      reply: botResponse.reply || botResponse.message || botResponse.output || "I'm here to help!",
      suggestions: botResponse.suggestions,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    
    console.error("Error sending to n8n:", error);
    throw error;
  }
};

export const sendAudioToN8N = async (
  audioBlob: Blob,
  audioDuration: number,
  guestData: GuestData | null
): Promise<N8NResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS * 2); // Double timeout for audio

  try {
    const formData = new FormData();
    const extension = audioBlob.type.includes("webm") ? "webm" : "mp4";
    formData.append("audio", audioBlob, `voice-message.${extension}`);
    formData.append("guest_id", guestData?.id || "anonymous");
    formData.append("guest_name", guestData?.full_name || "Guest");
    formData.append("room_number", guestData?.room_number || "Unknown");
    formData.append("audio_duration", audioDuration.toString());
    formData.append("timestamp", new Date().toISOString());
    formData.append("message_type", "audio");

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      signal: controller.signal,
      body: formData,
      // Don't set Content-Type header - browser sets it automatically with boundary
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to send audio: ${response.status}`);
    }

    const botResponse = await response.json();
    
    return {
      reply: botResponse.reply || botResponse.message || botResponse.output || "I received your voice message!",
      suggestions: botResponse.suggestions,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    
    console.error("Error sending audio to n8n:", error);
    throw error;
  }
};
