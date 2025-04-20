import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { SpeechRecognition } from "../../../types";

const VoiceInput = ({
  onInputChange,
  disabled,
  value,
}: {
  onInputChange: (text: string) => void;
  disabled?: boolean;
  value?: string;
}) => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [interimTranscript, setInterimTranscript] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event) => {
          let interimText = "";
          let finalText = value || "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript + " ";
              onInputChange(finalText);
            } else {
              interimText += event.results[i][0].transcript;
            }
          }

          setInterimTranscript(interimText);
        };

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setListening(false);
        };

        recognitionInstance.onend = () => {
          setListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [value, onInputChange]);

  const toggleVoiceRecording = () => {
    if (!recognition) {
      console.error("Speech recognition not available");
      return;
    }

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      try {
        recognition.start();
        setListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {listening && (
        <div className="flex items-center text-green-600 mb-2">
          <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
          Listening...
        </div>
      )}

      <div className="border rounded-md p-4 min-h-[120px] bg-gray-50">
        {value || interimTranscript ? (
          <>
            <p>{value}</p>
            <p className="text-gray-400">{interimTranscript}</p>
          </>
        ) : (
          <p className="text-gray-400">
            {listening
              ? "Speak now..."
              : "Press the microphone button to start speaking"}
          </p>
        )}
      </div>

      <Button
        onClick={toggleVoiceRecording}
        variant={listening ? "destructive" : "default"}
        className="w-full"
        disabled={disabled}
      >
        {listening ? (
          <>
            <MicOff className="mr-2 h-4 w-4" /> Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" /> Start Recording
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceInput;
