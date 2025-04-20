"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Camera,
  Mic,
  MicOff,
  PauseCircle,
  Play,
  Upload,
  Volume2,
} from "lucide-react";
import { detectExtensions } from "@/utils/detectExtensions";

// Add type definitions for Speech Recognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    //@ts-ignore
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    //@ts-ignore
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

// Define types
interface AnalysisData {
  faceDetected: boolean;
  confidence: number;
  emotion: string;
  emotionScores: Record<string, number>;
  confidenceHistory: number[];
  processedImage?: string;
}

interface ChartDataPoint {
  time: number;
  confidence: number;
}

interface EmotionScore {
  emotion: string;
  score: number;
}

interface InterviewSession {
  sessionId: string;
  jobRole: string;
  duration: number;
  status: "setup" | "active" | "completed";
  currentQuestion: string | null;
  currentQuestionId: number; // Add a unique ID for each question to track changes
  isLoadingQuestion: boolean; // Add a dedicated loading state for questions
  answers: { question: string; answer: string }[];
  timeRemaining: number;
  feedback: string | null;
}

// Base API URL
const API_URL = "http://127.0.0.1:8000";

function Genesis() {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State - Setup
  const [step, setStep] = useState<"setup" | "interview" | "feedback">("setup");
  const [jobRole, setJobRole] = useState<string>("");
  const [duration, setDuration] = useState<number>(10); // 10 minutes default
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State - Interview
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<"voice" | "text">("voice");
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isRequestingQuestion, setIsRequestingQuestion] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [questionLock, setQuestionLock] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  // State - Speech Recognition
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // State - Speech Synthesis
  const [speaking, setSpeaking] = useState<boolean>(false);

  // useEffect(() => {
  //   detectExtensions().then((res) => {
  //     setExtensions(res);
  //     setCanProceed(res.length === 0);
  //   });
  // }, []);

  // Setup speech recognition on component mount
  useEffect(() => {
    // Setup speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
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

        setRecognition(recognitionInstance);
      }
    }
  }, [currentAnswer]);

  // Start camera feed and capture periodic frames for analysis
  useEffect(() => {
    let stream: MediaStream | null = null;
    let captureInterval: NodeJS.Timeout | null = null;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        setError(
          `Error accessing camera: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error("Error accessing camera:", err);
      }
    }

    if (step === "interview") {
      setupCamera();

      // Capture frame every 2 seconds for analysis
      captureInterval = setInterval(captureAndAnalyze, 2000);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraActive(false);
      }
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [step, session?.sessionId]);

  useEffect(() => {
    // Check API connectivity
    const checkAPI = async () => {
      try {
        const response = await fetch(`${API_URL}`);
        if (response.ok) {
          console.log("API connection successful");
        } else {
          console.error("API returned error status:", response.status);
          setError(
            "Cannot connect to the interview server. Please try again later."
          );
        }
      } catch (err) {
        console.error("API connection error:", err);
        setError(
          "Cannot connect to the interview server. Please check your network connection."
        );
      }
    };

    checkAPI();
  }, []);

  // Periodically check interview status
  useEffect(() => {
    let statusInterval: NodeJS.Timeout | null = null;

    if (step === "interview" && session?.sessionId) {
      checkInterviewStatus();
      statusInterval = setInterval(checkInterviewStatus, 5000);
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [step, session?.sessionId]);

  // Speak question when it changes
  useEffect(() => {
    if (session?.currentQuestion && step === "interview") {
      speakText(session.currentQuestion);
    }
  }, [session?.currentQuestion]);

  // Capture frame and send for analysis
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !session?.sessionId) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not get canvas context");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), "image/jpeg")
      );

      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      const response = await fetch(
        `${API_URL}/analyze-image/${session.sessionId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AnalysisData = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error("Error in analysis:", err);
    }
  };

  // Start interview session
  const startInterview = async () => {
    if (!jobRole || !cvFile || !duration) {
      setError("Please fill all fields before starting the interview");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("cv_file", cvFile);
      formData.append("job_role", jobRole);
      formData.append("duration", duration.toString());

      console.log(
        "Starting interview with formData:",
        Object.fromEntries(formData)
      );

      const response = await fetch(`${API_URL}/start-interview`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start interview");
      }

      const data = await response.json();
      console.log("Interview started successfully:", data);

      // Set initial question if it's included in the response
      const initialQuestion = data.first_question || null;
      setPreviousQuestions(initialQuestion ? [initialQuestion] : []);

      setSession({
        sessionId: data.session_id,
        jobRole,
        duration,
        status: "active",
        currentQuestion: initialQuestion,
        currentQuestionId: 1,
        isLoadingQuestion: false,
        answers: [],
        timeRemaining: duration * 60,
        feedback: null,
      });

      setStep("interview");

      // Only get question if it wasn't included in the response
      if (!initialQuestion) {
        // Wait for state to update before requesting first question
        setTimeout(() => {
          getNextQuestion(data.session_id);
        }, 300);
      }
    } catch (err) {
      console.error("Error starting interview:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.currentQuestion) {
      console.log(
        `Question displayed: ${session.currentQuestion.substring(0, 30)}...`
      );

      // Check if this is a first-time question or we've switched back to a previous question
      if (
        previousQuestions.length > 0 &&
        !previousQuestions.includes(session.currentQuestion) &&
        !isRequestingQuestion
      ) {
        console.warn("Detected unauthorized question change!");
      }
    }
  }, [session?.currentQuestion, previousQuestions, isRequestingQuestion]);

  // Check interview status
  const checkInterviewStatus = async () => {
    if (!session?.sessionId) return;

    try {
      const response = await fetch(
        `${API_URL}/check-status/${session.sessionId}`
      );
      const data = await response.json();

      if (!data.active) {
        // Interview ended
        setSession({
          ...session,
          status: "completed",
          timeRemaining: 0,
        });

        // Get feedback
        getFeedback();

        // Move to feedback step
        setStep("feedback");
        return;
      }

      // Update time remaining
      setSession({
        ...session,
        timeRemaining: data.time_remaining || 0,
      });
    } catch (err) {
      console.error("Error checking interview status:", err);
    }
  };

  // Get next interview question
  const getNextQuestion = async (sessionId?: string) => {
    // Get the session ID, with better logging
    const id = sessionId || session?.sessionId;

    if (!id) {
      console.error("No session ID available for getNextQuestion");
      setError("Session ID is missing - please restart the interview");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add more debugging information
      console.log(`Fetching question for session ID: ${id}`);
      console.log(`Current session state:`, session);

      // Make the API request with better error handling
      const response = await fetch(`${API_URL}/get-question/${id}`);

      // Check for errors first before trying to parse JSON
      if (!response.ok) {
        // Try to get error details from response
        const errorText = await response.text();
        let errorMessage = `Server error: ${response.status}`;

        try {
          // Try to parse as JSON for more details
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text if available
          if (errorText) errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      // Parse the response
      const data = await response.json();

      if (!data.question) {
        throw new Error("No question received from server");
      }

      console.log("Question data received:", data);

      // Update session state
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentQuestion: data.question,
          currentQuestionId: (prev.currentQuestionId || 0) + 1,
        };
      });

      // Reset answer state
      setCurrentAnswer("");
      setInterimTranscript("");
      setAnswerSubmitted(false);
    } catch (err) {
      console.error("Question fetch error:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (
      !session?.sessionId ||
      !session.currentQuestion ||
      !currentAnswer.trim()
    ) {
      setError("Please provide an answer before submitting");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sessionId = session.sessionId;
      const questionText = session.currentQuestion;
      const answerText = currentAnswer.trim();

      console.log(
        `Submitting answer for question: ${questionText.substring(0, 30)}...`
      );

      const response = await fetch(`${API_URL}/submit-answer/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: answerText,
          question: questionText,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit answer");
      }

      // Update only the answers array without changing the question
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: [
            ...prev.answers,
            { question: questionText, answer: answerText },
          ],
          // DO NOT update currentQuestion here
        };
      });

      setAnswerSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!session?.sessionId) return;

    // Check if there are any answers recorded
    if (session.answers.length === 0) {
      if (
        !confirm(
          "You haven't submitted any answers yet. Are you sure you want to end the interview?"
        )
      ) {
        return;
      }
    } else if (
      !confirm(
        "Are you sure you want to end the interview? This will generate your feedback."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, let's verify all answers were properly recorded on the backend
      // by checking the number of QA pairs stored
      const verifyResponse = await fetch(
        `${API_URL}/check-qa-count/${session.sessionId}`
      );
      const verifyData = await verifyResponse.json();

      // If the backend has fewer QA pairs than our frontend, something is wrong
      if (verifyData.qa_count < session.answers.length) {
        console.warn(
          `Answer count mismatch: Frontend has ${session.answers.length}, backend has ${verifyData.qa_count}`
        );

        // We could add recovery logic here if needed
        if (
          !confirm(
            `Some of your answers may not have been properly recorded (${verifyData.qa_count} of ${session.answers.length}). Continue anyway?`
          )
        ) {
          setLoading(false);
          return;
        }
      }

      // Now end the interview
      const response = await fetch(
        `${API_URL}/end-interview/${session.sessionId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to end interview");
      }

      // Update session status
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "completed",
        };
      });

      // Get feedback with a short delay to ensure backend processing is complete
      setTimeout(async () => {
        await getFeedback();

        // Move to feedback step
        setStep("feedback");
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("End interview error:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  // Get interview feedback
  const getFeedback = async () => {
    if (!session?.sessionId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/get-feedback/${session.sessionId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get feedback");
      }

      const data = await response.json();

      // Update session with feedback
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: data.feedback,
        };
      });
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Start or stop voice recording
  const toggleVoiceRecording = () => {
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
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Start handlers
      utterance.onstart = () => {
        setIsAISpeaking(true);
        if (videoPlayerRef.current) {
          videoPlayerRef.current
            .play()
            .catch((e) => console.error("Video play error:", e));
        }
      };

      // End handlers
      utterance.onend = () => {
        setIsAISpeaking(false);
        if (videoPlayerRef.current) {
          videoPlayerRef.current.pause();
        }
      };

      utterance.onerror = () => {
        setIsAISpeaking(false);
        if (videoPlayerRef.current) {
          videoPlayerRef.current.pause();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get color for confidence level
  const getConfidenceColor = (confidence: number): string => {
    if (confidence < 30) return "bg-red-500";
    if (confidence < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get color for emotion type
  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      happy: "bg-green-500",
      sad: "bg-blue-500",
      angry: "bg-red-500",
      fear: "bg-purple-500",
      disgust: "bg-yellow-700",
      surprise: "bg-pink-500",
      neutral: "bg-gray-500",
    };
    return colors[emotion.toLowerCase()] || "bg-gray-400";
  };

  // Get confidence chart data
  const getChartData = (): ChartDataPoint[] => {
    if (!analysisData?.confidenceHistory) return [];
    return analysisData.confidenceHistory.map((value, index) => ({
      time: index,
      confidence: value,
    }));
  };

  // Get sorted emotion scores
  const getEmotionScores = (): EmotionScore[] => {
    if (!analysisData?.emotionScores) return [];
    return Object.entries(analysisData.emotionScores)
      .map(([emotion, score]) => ({ emotion, score }))
      .sort((a, b) => b.score - a.score);
  };

  // Extract score from feedback
  const extractScoreFromFeedback = (): string => {
    if (!session?.feedback) return "--";

    const scoreRegex = /(\d+(\.\d+)?)\s*\/\s*10/;
    const match = session.feedback.match(scoreRegex);
    return match ? match[1] : "--";
  };

  // Format feedback for display
  const formatFeedback = (): string => {
    if (!session?.feedback) return "";

    const feedback = session.feedback;

    // First handle markdown bold formatting
    let formattedFeedback = feedback.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    // Convert bullet points for better organization
    formattedFeedback = formattedFeedback.replace(/- ([^\n]+)/g, "<li>$1</li>");

    // Wrap bullet point lists in <ul> tags
    formattedFeedback = formattedFeedback.replace(
      /<li>([^<]+)<\/li>(\s*<li>)/g,
      "<li>$1</li>$2"
    );
    formattedFeedback = formattedFeedback.replace(
      /(<li>(?:[^<]+<\/li>\s*)+)/g,
      "<ul>$1</ul>"
    );

    // Format numbered lists (like 1. 2. 3.) and wrap with section headers
    formattedFeedback = formattedFeedback.replace(
      /(\d+\.\s+)([^:]+):([^\n]+)/g,
      '<div class="feedback-section"><h3>$2</h3><p>$3</p></div>'
    );

    // Format sections with headers without numbers
    formattedFeedback = formattedFeedback.replace(
      /([A-Z][^:]+):([^\n]+)/g,
      '<div class="feedback-section"><h3>$1</h3><p>$2</p></div>'
    );

    // Convert paragraphs properly
    formattedFeedback = formattedFeedback.replace(/\n\n/g, "</p><p>");

    // Convert remaining newlines to <br> tags
    formattedFeedback = formattedFeedback.replace(/\n/g, "<br>");

    return formattedFeedback;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  // UI part of the component - this goes inside the AIInterviewAssistant function after all state and logic
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black pt-6">
      <div className="w-[90%] max-w-[1400px] flex flex-col gap-6">
        {step === "setup" && (
          <div className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Genesis</CardTitle>
                <CardDescription>
                  Upload your CV, select a job role, and prepare for an
                  AI-powered interview with real-time confidence analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="cv">Upload CV/Resume (PDF format)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {cvFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected file: {cvFile.name}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="jobRole">Job Role/Position</Label>
                    <Input
                      id="jobRole"
                      placeholder="e.g., Software Engineer, Marketing Manager"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duration">Interview Duration</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(value) => setDuration(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">
                          5 minutes (quick practice)
                        </SelectItem>
                        <SelectItem value="10">
                          10 minutes (standard)
                        </SelectItem>
                        <SelectItem value="15">
                          15 minutes (comprehensive)
                        </SelectItem>
                        <SelectItem value="20">
                          20 minutes (extensive)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Make sure your camera and microphone are enabled for the best
                  experience.
                </p>
                <Button onClick={startInterview} disabled={loading}>
                  {loading ? "Starting..." : "Start Interview"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {step === "interview" && (
          <div className="w-[90%] max-w-[1400px] mx-auto pt-6">
            <div className="mb-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Genesis</h1>
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md">
                Time Remaining:{" "}
                {formatTimeRemaining(session?.timeRemaining || 0)}
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camera Feed and Question */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Camera Feed</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {/* Main camera feed or video */}
                    <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                      <video
                        ref={videoPlayerRef}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        src="/videos/avatar.mp4" // Update with your video path
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      Current Question
                      {speaking && (
                        <Volume2 className="ml-2 h-4 w-4 animate-pulse" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-md min-h-[100px] flex items-center">
                      {session?.currentQuestion ? (
                        <p className="text-lg text-black">
                          {session.currentQuestion}
                        </p>
                      ) : (
                        <div className="text-center w-full text-gray-500">
                          {loading
                            ? "Loading next question..."
                            : "Waiting for question..."}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        session?.currentQuestion &&
                        speakText(session.currentQuestion)
                      }
                    >
                      <Volume2 className="mr-2 h-4 w-4" /> Repeat Question
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Confidence Analysis and Answer Input */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Confidence Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisData ? (
                      <>
                        <div className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">
                              Confidence Score
                            </span>
                            <span className="font-bold">
                              {analysisData.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={analysisData.confidence}
                            className={`h-2 ${getConfidenceColor(
                              analysisData.confidence
                            )}`}
                          />
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">
                              Primary Emotion
                            </h3>
                            <p className="text-lg font-semibold capitalize">
                              {analysisData.emotion !== "unknown"
                                ? analysisData.emotion
                                : "No emotion detected"}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-1">
                              Face Detection
                            </h3>
                            <p
                              className={`text-lg font-semibold ${
                                analysisData.faceDetected
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {analysisData.faceDetected
                                ? "Detected"
                                : "Not detected"}
                            </p>
                          </div>
                        </div>

                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getChartData()}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.3}
                              />
                              <XAxis
                                tick={false}
                                label={{
                                  value: "Time",
                                  position: "insideBottom",
                                }}
                              />
                              <YAxis domain={[0, 100]} width={35} />
                              <Tooltip
                                formatter={(value: number) => [
                                  `${value.toFixed(1)}%`,
                                  "Confidence",
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="confidence"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        Initializing confidence analysis...
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Your Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      defaultValue="voice"
                      onValueChange={(value) =>
                        setInputMethod(value as "voice" | "text")
                      }
                    >
                      <TabsList className="mb-4">
                        <TabsTrigger value="voice">Voice Input</TabsTrigger>
                        <TabsTrigger value="text">Text Input</TabsTrigger>
                      </TabsList>

                      <TabsContent value="voice">
                        <div className="space-y-4">
                          {listening && (
                            <div className="flex items-center text-green-600 mb-2">
                              <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                              Listening...
                            </div>
                          )}

                          <div className="border rounded-md p-4 min-h-[120px] bg-gray-50">
                            {currentAnswer || interimTranscript ? (
                              <>
                                <p>{currentAnswer}</p>
                                <p className="text-gray-400">
                                  {interimTranscript}
                                </p>
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
                          >
                            {listening ? (
                              <>
                                <MicOff className="mr-2 h-4 w-4" /> Stop
                                Recording
                              </>
                            ) : (
                              <>
                                <Mic className="mr-2 h-4 w-4" /> Start Recording
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="text">
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Type your answer here..."
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentAnswer("")}
                        disabled={!currentAnswer || answerSubmitted}
                      >
                        Clear
                      </Button>
                      <div className="space-x-2">
                        <Button
                          onClick={submitAnswer}
                          variant="outline"
                          size="sm"
                          disabled={
                            loading || !currentAnswer.trim() || questionLock
                          }
                        >
                          {loading ? "Submitting..." : "Submit"}
                        </Button>

                        <Button
                          variant="default"
                          onClick={() => getNextQuestion()}
                          disabled={
                            !answerSubmitted || loading || fetchingQuestion
                          }
                        >
                          {fetchingQuestion ? "Loading..." : "Next Question"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      onClick={endInterview}
                      disabled={loading}
                      className="ml-auto"
                    >
                      End Interview
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        )}

        {step === "feedback" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Interview Feedback
                </CardTitle>
                <CardDescription className="text-center">
                  Detailed analysis of your interview performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-500">
                      Generating your interview feedback...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Interview Stats
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Questions Answered:
                              </span>
                              <span className="font-semibold">
                                {session?.answers.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Job Role:</span>
                              <span className="font-semibold">
                                {session?.jobRole || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Average Confidence:
                              </span>
                              <span className="font-semibold">
                                {analysisData?.confidence
                                  ? `${analysisData.confidence.toFixed(1)}%`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Overall Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-5xl font-bold text-blue-600 mb-1">
                              {extractScoreFromFeedback()}
                            </div>
                            <div className="text-gray-500">out of 10</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Detailed Feedback
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {session?.feedback ? (
                          <div className="space-y-6">
                            {/* Add custom CSS for the feedback sections */}
                            <style jsx global>{`
                              .feedback-section {
                                margin-bottom: 1.5rem;
                                padding: 1rem;
                                border-radius: 0.5rem;
                                background-color: #f8fafc;
                                border-left: 4px solid #3b82f6;
                              }
                              .feedback-section h3 {
                                font-size: 1.1rem;
                                font-weight: 600;
                                margin-bottom: 0.5rem;
                                color: #1e40af;
                              }
                              .feedback-section p {
                                color: #334155;
                              }
                              ul {
                                list-style-type: disc;
                                padding-left: 1.5rem;
                                margin: 0.75rem 0;
                              }
                              li {
                                margin-bottom: 0.5rem;
                              }
                              .feedback-overview {
                                background-color: #eff6ff;
                                padding: 1.25rem;
                                border-radius: 0.5rem;
                                margin-bottom: 1.5rem;
                              }
                              .feedback-summary {
                                font-size: 1.1rem;
                                font-weight: 500;
                                margin-bottom: 1rem;
                              }
                            `}</style>

                            {/* Overview section at the top */}
                            <div className="feedback-overview">
                              <h3 className="feedback-summary text-gray-700">
                                Interview Performance Summary
                              </h3>
                              <p className="text-gray-700">
                                Overall Score:{" "}
                                <span className="font-bold text-blue-600">
                                  {extractScoreFromFeedback()}/10
                                </span>
                              </p>
                            </div>

                            {/* Main feedback content with improved formatting */}
                            <div
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: `<div>${formatFeedback()}</div>`,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-8 flex flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 text-gray-400 mb-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                            <p>No feedback available yet</p>
                            <p className="text-sm mt-2">
                              Please wait while we generate your interview
                              analysis
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={() => window.print()}>
                        Print Feedback
                      </Button>
                      <Button
                        onClick={() => {
                          // Reset state and go back to setup
                          setStep("setup");
                          setSession(null);
                          setAnalysisData(null);
                          setCvFile(null);
                          setJobRole("");
                          setDuration(10);
                          setCurrentAnswer("");
                          setInterimTranscript("");
                        }}
                      >
                        Start New Interview
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Genesis;
