import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_URL = "https://teama2.app.n8n.cloud/webhook-test/Ahlan-Assistant";
const TIMEOUT_MS = 30000;

interface ChatRequest {
  message: string;
}

interface N8NPayload {
  message: string;
  guest_id: string;
  guest_name: string;
  room_number: string;
  timestamp: string;
  message_type: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Fetch guest profile from database
    const { data: guestProfile, error: profileError } = await supabase
      .from("guests")
      .select("id, full_name, room_number")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      // Fall back to user ID if no guest profile exists
    }

    // Parse request body
    const { message }: ChatRequest = await req.json();
    
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize message - basic input validation
    const sanitizedMessage = message.trim().slice(0, 2000);
    if (sanitizedMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build payload for n8n
    const payload: N8NPayload = {
      message: sanitizedMessage,
      guest_id: user.id,
      guest_name: guestProfile?.full_name || "Guest",
      room_number: guestProfile?.room_number || "Unknown",
      timestamp: new Date().toISOString(),
      message_type: "text",
    };

    console.log(`Sending message to n8n for guest: ${payload.guest_name}, room: ${payload.room_number}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Forward to n8n webhook
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!n8nResponse.ok) {
        console.error(`n8n webhook error: ${n8nResponse.status}`);
        return new Response(
          JSON.stringify({ error: "Failed to process message" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const botResponse = await n8nResponse.json();
      console.log("n8n response received successfully");

      return new Response(
        JSON.stringify({
          reply: botResponse.reply || botResponse.message || botResponse.output || "I'm here to help!",
          suggestions: botResponse.suggestions,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("n8n webhook timeout");
        return new Response(
          JSON.stringify({ error: "Request timed out" }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
