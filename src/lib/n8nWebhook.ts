import { GuestData } from "@/hooks/useGuestData";

const N8N_WEBHOOK_URL = "https://teama2.app.n8n.cloud/webhook-test/Ahlan-Assistant";
const TIMEOUT_MS = 30000;

export interface N8NResponse {
  reply: string;
  suggestions?: string[];
}

export const sendMessageToN8N = async (
  messageText: string,
  guestData: GuestData | null
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
        guest_id: guestData?.id || "anonymous",
        guest_name: guestData?.full_name || "Guest",
        room_number: guestData?.room_number || "Unknown",
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
