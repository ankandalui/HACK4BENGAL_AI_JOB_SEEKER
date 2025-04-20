import { useEffect, useState } from "react";
import { askGemini } from "@/utils/gemini";
import { toast } from "sonner";

const keywords = {
  dashboard: ["/dashboard", "dashboard", "home", "main page"],
  genesis: ["/genesis", "genesis", "genesis page"],
  login: ["/login", "/auth", "login", "sign in", "log in", "authenticate"],
};

export default function useVoiceAssistant(enabled: boolean) {
  const [isListening, setIsListening] = useState(false);

  // Improved function to speak responses using more human-like voice
  const speakResponse = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google UK English Female") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Karen") ||
        voice.name.includes("Moira") ||
        (voice.name.includes("Google") && voice.name.includes("Female")) ||
        (voice.name.includes("Microsoft") && voice.name.includes("Natural"))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    // Trigger recognition after speech ends
    utterance.onend = () => {
      window.dispatchEvent(new Event("voice:speechEnd"));
      if (onEnd) onEnd();
    };

    window.dispatchEvent(new Event("voice:speechStart"));
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Notify about state changes for listening indicator
    if (isListening) {
      window.dispatchEvent(new Event("voice:listeningStart"));
    } else {
      window.dispatchEvent(new Event("voice:listeningEnd"));
    }
  }, [isListening]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Ensure browser compatibility
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Voice recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Get voices ready and ensure they're loaded
    if (window.speechSynthesis) {
      // Force voices to load
      window.speechSynthesis.getVoices();

      // Handle voice loading for some browsers
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }

    // Welcome message with a more casual, human-like tone
    setTimeout(() => {
      speakResponse(
        "Hi there! I'm Intera, a platform where you can grab your dream job by preparing mock Interviews. You can ask me about interviews or just say things like 'go to dashboard' or 'login' to navigate around.",
        () => {
          startRecognition();
        }
      );
    }, 1000);

    const startRecognition = () => {
      try {
        window.speechSynthesis?.cancel();

        recognition.start();
        setIsListening(true);
        console.log("Voice recognition started");
        window.dispatchEvent(new Event("voice:listeningStart"));
      } catch (err) {
        console.error("Recognition error:", err);
        setIsListening(false);
        window.dispatchEvent(new Event("voice:listeningEnd"));
        setTimeout(() => startRecognition(), 3000);
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice input:", transcript);

      // Show recognition feedback
      toast.info(`I heard: "${transcript}"`, { duration: 2000 });

      try {
        // Check if this is a navigation command
        const isNavigationCommand =
          transcript.includes("go to") ||
          transcript.includes("navigate") ||
          transcript.includes("open") ||
          transcript.includes("take me") ||
          transcript.includes("login") ||
          transcript.includes("dashboard") ||
          transcript.includes("genesis") ||
          transcript.includes("sign in");

        if (isNavigationCommand) {
          // This seems like a navigation command, check if it matches our routes
          let matchedRoute = null;

          // Check each keyword category
          for (const [route, terms] of Object.entries(keywords)) {
            if (
              terms.some((term) => transcript.includes(term.replace("/", "")))
            ) {
              matchedRoute = terms[0]; // Use the first path (the full path)
              break;
            }
          }

          if (matchedRoute) {
            // Found a matching route - use more casual language
            const responseText = `Sure thing, taking you to ${matchedRoute.replace(
              "/",
              ""
            )} now!`;
            speakResponse(responseText);
            toast.success(responseText, { duration: 2500 });

            // Stop recognition and listening
            recognition.stop();
            setIsListening(false);
            window.dispatchEvent(new Event("voice:listeningEnd"));

            // Navigate after a short delay
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("voice:navigate", { detail: matchedRoute })
              );
            }, 1000);

            return;
          }
        }

        // Not a navigation command or no matching route, treat as a conversation
        // Use Gemini for a conversation with more casual, friendly prompt
        const geminiResponse = await askGemini(
          `The user said: "${transcript}". 
           Respond in a very casual, conversational way as a friendly voice assistant for a job matching portal.
           Sound natural and human-like, using contractions and casual phrases.
           You can discuss interview tips, resume advice, or job search strategies.
           If they asked about navigation, mention they can say "go to dashboard" or "login".
           Keep your response under 30 words, conversational and friendly.
           Use simple, everyday language like you're chatting with a friend.`
        );

        console.log("Gemini conversational response:", geminiResponse);

        // Speak the response from Gemini directly
        speakResponse(geminiResponse);
        toast.success(geminiResponse, { duration: 3000 });

        // Restart listening after a delay to allow for the response
        setTimeout(() => startRecognition(), geminiResponse.length * 80); // Timing based on text length
      } catch (error) {
        console.error("Error processing voice command:", error);
        const errorMsg =
          "Oops, I couldn't quite process that. Mind trying again?";
        speakResponse(errorMsg);
        toast.error(errorMsg, { duration: 3000 });

        // Restart listening
        setTimeout(() => startRecognition(), 3000);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      // Dispatch event to hide listening animation
      window.dispatchEvent(new Event("voice:listeningEnd"));

      let errorMessage = "Speech recognition error";

      if (event.error === "not-allowed") {
        errorMessage = "I'll need microphone access to help you";
        speakResponse(errorMessage);
      } else {
        errorMessage = `Hmm, there was a little hiccup with the speech recognition`;
      }

      toast.error(errorMessage, { duration: 5000 });

      // Retry after delay
      setTimeout(() => startRecognition(), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Dispatch event to hide listening animation
      window.dispatchEvent(new Event("voice:listeningEnd"));
      console.log("Voice recognition ended");
    };

    // Start voice recognition after a short delay to allow the welcome message
    setTimeout(() => startRecognition(), 3000);

    return () => {
      // Clean up
      recognition.stop();
      window.speechSynthesis?.cancel();
      setIsListening(false);
      // Dispatch event to hide listening animation
      window.dispatchEvent(new Event("voice:listeningEnd"));
    };
  }, [enabled]);

  return { isListening };
}
