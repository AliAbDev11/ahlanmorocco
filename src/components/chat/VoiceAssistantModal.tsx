import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface VoiceAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { "agent-id": string },
        HTMLElement
      >;
    }
  }
}

const AGENT_ID = "agent_7901kfvhpqsyftntmv5a5ksff8tp";
const FALLBACK_URL = `https://elevenlabs.io/app/talk-to?agent_id=${AGENT_ID}&branch_id=agtbrch_0801kfvhpsfmekrv44nxznabvcdj`;

const VoiceAssistantModal = ({ open, onOpenChange }: VoiceAssistantModalProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    const existingScript = document.querySelector(
      'script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]'
    );
    
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    // Load the ElevenLabs script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setEmbedError(true);
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount to avoid reloading
    };
  }, []);

  const handleOpenFallback = () => {
    window.open(FALLBACK_URL, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="text-lg font-serif">Talk to Ahlan</DialogTitle>
        </DialogHeader>
        
        <div className="h-[520px] w-full flex items-center justify-center bg-background">
          {embedError ? (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <p className="text-muted-foreground">
                Unable to load the voice assistant. Click below to open in a new tab.
              </p>
              <Button onClick={handleOpenFallback} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Voice Assistant
              </Button>
            </div>
          ) : scriptLoaded ? (
            <elevenlabs-convai agent-id={AGENT_ID} />
          ) : (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistantModal;
