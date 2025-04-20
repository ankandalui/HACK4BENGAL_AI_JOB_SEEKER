// speechUtils.ts
import { SpeechRecognition } from "../../types";

// Setup speech recognition
export const setupSpeechRecognition = (
  currentAnswer: string,
  setCurrentAnswer: React.Dispatch<React.SetStateAction<string>>,
  setInterimTranscript: React.Dispatch<React.SetStateAction<string>>,
  setListening: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): SpeechRecognition | null => {
  if (typeof window === "undefined") return null;

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) return null;

  const recognitionInstance = new SpeechRecognitionAPI();
  recognitionInstance.continuous = true;
  recognitionInstance.interimResults = true;
  recognitionInstance.lang = "en-US";

  // Configure recognition
  recognitionInstance.onresult = (event) => {
    let interimText = "";
    let finalText = currentAnswer;

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + " ";
        setCurrentAnswer(finalText);
      } else {
        interimText += event.results[i][0].transcript;
      }
    }

    setInterimTranscript(interimText);
  };

  recognitionInstance.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    setListening(false);
    setError(
      `Speech recognition error: ${event.error}. Try again or use text input.`
    );
  };

  recognitionInstance.onend = () => {
    setListening(false);
  };

  return recognitionInstance;
};

// Toggle voice recording
export const toggleVoiceRecording = (
  recognition: SpeechRecognition | null,
  listening: boolean,
  setListening: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): void => {
  if (!recognition) {
    setError("Speech recognition is not available in your browser");
    return;
  }

  if (listening) {
    recognition.stop();
    setListening(false);
  } else {
    try {
      recognition.start();
      setListening(true);
      setError(null);
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Failed to start speech recognition");
    }
  }
};

// Speak text using browser's speech synthesis
export const speakText = (
  text: string,
  setSpeaking: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  if (!("speechSynthesis" in window)) return;

  // Cancel any existing speech without triggering error
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang.includes("en-"));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);

  utterance.onerror = (event) => {
    if (event.error === "interrupted") {
      console.warn("Speech was interrupted by another action.");
    } else {
      console.error("Speech synthesis error:", event.error || "Unknown error");
    }
    setSpeaking(false);
  };

  // Speak the text
  window.speechSynthesis.speak(utterance);
};
