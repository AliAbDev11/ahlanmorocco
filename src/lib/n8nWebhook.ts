import { supabase } from "@/integrations/supabase/client";

const TIMEOUT_MS = 30000;

export interface N8NResponse {
  reply: string;
  suggestions?: string[];
}

export const sendMessageToN8N = async (
  messageText: string
): Promise<N8NResponse> => {
  // Validate message input
  const sanitizedMessage = messageText.trim().slice(0, 2000);
  if (!sanitizedMessage) {
    throw new Error("Message cannot be empty");
  }

  // Call the authenticated edge function instead of direct webhook
  const { data, error } = await supabase.functions.invoke("chat-webhook", {
    body: { message: sanitizedMessage },
  });

  if (error) {
    console.error("Error calling chat webhook:", error);
    
    if (error.message?.includes("timeout") || error.message?.includes("504")) {
      throw new Error("Request timed out. Please try again.");
    }
    
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      throw new Error("Please log in to use the chat.");
    }
    
    throw new Error("Failed to send message. Please try again.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    reply: data?.reply || "I'm here to help!",
    suggestions: data?.suggestions,
  };
};
