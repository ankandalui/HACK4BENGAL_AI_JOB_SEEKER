"use client";

import { useState, useEffect } from "react";
import useVoiceAssistant from "@/hooks/usevoiceAssistant";
import { useRouter } from "next/navigation";
import VoiceLottie from "./voice-lottie";
import { toast } from "sonner";

const VoiceHandler = ({ enabled }: { enabled: boolean }) => {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  // Pass the enabled prop directly to the hook
  const { isListening } = useVoiceAssistant(enabled);

  // Debug logging
  useEffect(() => {
    console.log("VoiceHandler: Voice enabled state changed to:", enabled);

    if (enabled) {
      // Display feedback that voice is now active
      toast.success("Voice assistant is ready! Try saying 'Go to dashboard'", {
        duration: 3000,
        id: "voice-enabled", // Prevent duplicate toasts
      });
    }
  }, [enabled]);

  // Listen for voice navigation events
  useEffect(() => {
    const handleVoiceNav = (e: CustomEvent) => {
      setNavigating(true);
      const path = e.detail;

      // Navigate after animation plays
      setTimeout(() => {
        router.push(path);
        setNavigating(false);
      }, 2000);
    };

    window.addEventListener("voice:navigate", handleVoiceNav as EventListener);

    return () => {
      window.removeEventListener(
        "voice:navigate",
        handleVoiceNav as EventListener
      );
    };
  }, [router]);

  return <>{navigating && <VoiceLottie />}</>;
};

export default VoiceHandler;
