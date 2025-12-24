import { GuestData } from "@/hooks/useGuestData";

const N8N_WEBHOOK_URL = "https://teama2.app.n8n.cloud/webhook-test/Ahlan-Assistant";
const TIMEOUT_MS = 30000;

export interface N8NResponse {
  reply: string;
  suggestions?: string[];
}

export interface AudioMessage {
  audio_data: string;
  audio_format: string;
  audio_duration: number;
}

export const sendMessageToN8N = async (
  messageText: string,
  guestData: GuestData | null,
  audioData?: AudioMessage
): Promise<N8NResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const payload: Record<string, unknown> = {
      message: messageText,
      guest_id: guestData?.id || "anonymous",
      guest_name: guestData?.full_name || "Guest",
      room_number: guestData?.room_number || "Unknown",
      timestamp: new Date().toISOString(),
      message_type: audioData ? "audio" : "text",
    };

    if (audioData) {
      payload.audio_data = audioData.audio_data;
      payload.audio_format = audioData.audio_format;
      payload.audio_duration = audioData.audio_duration;
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
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
