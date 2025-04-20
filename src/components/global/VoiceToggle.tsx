"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";
import { toast } from "sonner";
import VoiceLottie from "./voice-lottie";

const VoiceToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Listen for voice status events
    const handleListeningStart = () => setIsListening(true);
    const handleListeningEnd = () => setIsListening(false);
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    window.addEventListener("voice:listeningStart", handleListeningStart);
    window.addEventListener("voice:listeningEnd", handleListeningEnd);
    window.addEventListener("voice:speechStart", handleSpeechStart);
    window.addEventListener("voice:speechEnd", handleSpeechEnd);

    return () => {
      window.removeEventListener("voice:listeningStart", handleListeningStart);
      window.removeEventListener("voice:listeningEnd", handleListeningEnd);
      window.removeEventListener("voice:speechStart", handleSpeechStart);
      window.removeEventListener("voice:speechEnd", handleSpeechEnd);
    };
  }, []);

  const toggleVoice = () => {
    const newState = !enabled;
    setEnabled(newState);

    // Update parent component's state via custom event
    window.dispatchEvent(
      new CustomEvent("voice:toggle", { detail: { enabled: newState } })
    );

    if (newState) {
      toast.success("Voice assistant activated!", { duration: 2000 });
    } else {
      toast.info("Voice assistant deactivated", { duration: 2000 });
    }
  };

  return (
    <div className="flex justify-center mt-4">
      {isListening || isSpeaking ? (
        // Lottie animation when active
        <div className="relative flex items-center justify-center">
          <VoiceLottie />
          <div className="absolute bottom-0 -mb-1 text-xs text-primary-foreground font-medium">
            {isListening ? "Listening..." : "Speaking..."}
          </div>
        </div>
      ) : (
        // Toggle button when inactive
        <button
          onClick={toggleVoice}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            enabled
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {enabled ? (
            <>
              <Mic className="h-4 w-4" />
              <span>Voice Active</span>
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4" />
              <span>Enable Voice Guide</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default VoiceToggle;
