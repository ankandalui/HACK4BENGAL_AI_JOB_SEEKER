"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CVAnalysisResult,
  CodingQuestion,
  CodeEvaluation,
  UserSubmission,
} from "../../../../types";
import { analyzeCV, evaluateCode } from "@/utils/code";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/utils/uploadthing";
import "@uploadthing/react/styles.css";

// Dynamically import Monaco Editor with no SSR
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TimerProps {
  timeLimit: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeLimit, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <span>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

export default function Codekshetra() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "questions" | "results"
  >("upload");
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState("");
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentQuestion = analysis?.questions[currentQuestionIndex];

  const handleAnalyzeCV = async (url: string) => {
    setIsAnalyzing(true);
    setUploadError(null);

    try {
      const result = await analyzeCV(url);
      setAnalysis(result);
      setCurrentStep("questions");
      setCode(result.questions[0].starterCode || "");
    } catch (error) {
      console.error("CV analysis error:", error);
      setUploadError("Failed to analyze CV. Please try again.");
      toast({
        title: "Error",
        description: "Failed to analyze CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!currentQuestion) return;

    try {
      const result = await evaluateCode(
        code,
        currentQuestion,
        currentQuestion.testCases
      );
      setEvaluation(result);

      const submission: UserSubmission = {
        questionId: currentQuestion.id,
        code,
        submittedAt: new Date(),
      };
      setSubmissions([...submissions, submission]);

      if (result.isCorrect) {
        toast({
          title: "Success!",
          description: "Your solution is correct. Moving to next question.",
        });

        if (currentQuestionIndex < (analysis?.questions.length || 0) - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex((prev) => prev + 1);
            setEvaluation(null);
            setCode(
              analysis?.questions[currentQuestionIndex + 1].starterCode || ""
            );
          }, 2000);
        } else {
          setCurrentStep("results");
        }
      } else {
        toast({
          title: "Not quite right",
          description: "Check the feedback below and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Moving to the next question.",
      variant: "destructive",
    });

    if (currentQuestionIndex < (analysis?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setEvaluation(null);
      setCode(analysis?.questions[currentQuestionIndex + 1].starterCode || "");
    } else {
      setCurrentStep("results");
    }
  };

  // Function to handle manual analysis start (for testing)
  const handleManualStart = () => {
    // Sample hardcoded questions as a fallback
    const sampleAnalysis: CVAnalysisResult = {
      skillLevel: "intermediate",
      questions: [
        {
          id: "q1",
          title: "Array Sum",
          description:
            "Write a function that calculates the sum of all elements in an array of integers.",
          difficulty: "easy",
          timeLimit: 5,
          testCases: [
            {
              input: "[1, 2, 3, 4, 5]",
              expectedOutput: "15",
            },
            {
              input: "[-1, -2, -3, -4, -5]",
              expectedOutput: "-15",
            },
          ],
          starterCode: "function arraySum(arr) {\n  // Your code here\n}",
        },
        {
          id: "q2",
          title: "String Reversal",
          description:
            "Write a function that reverses a string without using the built-in reverse() method.",
          difficulty: "easy",
          timeLimit: 5,
          testCases: [
            {
              input: '"hello"',
              expectedOutput: '"olleh"',
            },
            {
              input: '"javascript"',
              expectedOutput: '"tpircsavaj"',
            },
          ],
          starterCode: "function reverseString(str) {\n  // Your code here\n}",
        },
        {
          id: "q3",
          title: "Find Missing Number",
          description:
            "Write a function that finds the missing number in an array of consecutive integers from 0 to n, where one number is missing.",
          difficulty: "medium",
          timeLimit: 10,
          testCases: [
            {
              input: "[0, 1, 3, 4]",
              expectedOutput: "2",
            },
            {
              input: "[9, 6, 4, 2, 3, 5, 7, 0, 1]",
              expectedOutput: "8",
            },
          ],
          starterCode:
            "function findMissingNumber(nums) {\n  // Your code here\n}",
        },
      ],
    };

    setAnalysis(sampleAnalysis);
    setCurrentStep("questions");
    setCode(sampleAnalysis.questions[0].starterCode || "");
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Codekshetra - AI-Powered Coding Assessment</CardTitle>
          <CardDescription>
            {currentStep === "upload" &&
              "Upload your CV to start your personalized coding assessment"}
            {currentStep === "questions" &&
              `Question ${currentQuestionIndex + 1}/${
                analysis?.questions.length
              }`}
            {currentStep === "results" && "Assessment Complete"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "upload" && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              {/* <Upload className="w-12 h-12 mb-4 text-gray-400" /> */}
              <UploadDropzone<OurFileRouter, "pdfUploader">
                endpoint="pdfUploader"
                onClientUploadComplete={async (res) => {
                  if (res?.[0]?.url) {
                    try {
                      await handleAnalyzeCV(res[0].url);
                    } catch (error) {
                      console.error("Upload handling error:", error);
                    }
                  }
                }}
                onUploadError={(error: Error) => {
                  setUploadError(error.message || "Failed to upload CV");
                  toast({
                    title: "Error",
                    description: error.message || "Failed to upload CV",
                    variant: "destructive",
                  });
                }}
              />

              {/* Manual start button for testing */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={handleManualStart}
                  disabled={isAnalyzing}
                >
                  Start Assessment Without CV
                </Button>
              </div>

              {isAnalyzing && (
                <Alert className="mt-4">
                  <AlertTitle>Analyzing CV</AlertTitle>
                  <AlertDescription>
                    Please wait while we analyze your CV...
                    <Progress className="mt-2" value={50} />
                  </AlertDescription>
                </Alert>
              )}

              {uploadError && (
                <Alert className="mt-4" variant="destructive">
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentStep === "questions" && currentQuestion && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {currentQuestion.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Difficulty: {currentQuestion.difficulty}
                  </p>
                </div>
                <Timer
                  timeLimit={currentQuestion.timeLimit}
                  onTimeUp={handleTimeUp}
                />
              </div>

              <div className="prose max-w-none">
                <p>{currentQuestion.description}</p>
              </div>

              <div className="h-[500px] border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCodeSubmit}>Submit Solution</Button>
              </div>

              {evaluation && (
                <Alert
                  className={
                    evaluation.isCorrect
                      ? "bg-green-100 border-green-500 text-green-900"
                      : "bg-red-100 border-red-500 text-red-900"
                  }
                >
                  <AlertTitle className="flex items-center gap-2">
                    {evaluation.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    {evaluation.isCorrect
                      ? "Correct Solution!"
                      : "Not Quite Right"}
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-2">
                      <p>
                        <strong>Time Complexity:</strong>{" "}
                        {evaluation.timeComplexity}
                      </p>
                      <p>
                        <strong>Space Complexity:</strong>{" "}
                        {evaluation.spaceComplexity}
                      </p>
                      {evaluation.optimizations.length > 0 && (
                        <div>
                          <strong>Optimization Suggestions:</strong>
                          <ul className="list-disc pl-4 mt-1">
                            {evaluation.optimizations.map((opt, idx) => (
                              <li key={idx}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p>
                        <strong>Feedback:</strong> {evaluation.feedback}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentStep === "results" && (
            <div className="space-y-4">
              <Alert className="bg-blue-100 border-blue-500 text-blue-900">
                <AlertTitle>Assessment Complete!</AlertTitle>
                <AlertDescription>
                  You've completed all questions. Here's your performance
                  summary:
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {submissions.map((submission, idx) => {
                  const question = analysis?.questions.find(
                    (q) => q.id === submission.questionId
                  );
                  return (
                    <Card key={idx} className="border border-gray-300">
                      <CardHeader className="bg-black">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-gray-200">
                              {question?.title}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              Submitted at:{" "}
                              {submission.submittedAt.toLocaleString()}
                            </CardDescription>
                          </div>
                          {submission.evaluation && (
                            <div
                              className={`px-3 py-1 rounded-full ${
                                submission.evaluation.isCorrect
                                  ? "bg-green-100 text-green-800 border border-green-500"
                                  : "bg-red-100 text-red-800 border border-red-500"
                              }`}
                            >
                              {submission.evaluation.isCorrect
                                ? "Correct"
                                : "Incorrect"}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-gray-100 p-4 rounded-md text-gray-900 overflow-x-auto">
                          <code>{submission.code}</code>
                        </pre>

                        {submission.evaluation && (
                          <div
                            className={`mt-4 p-4 rounded-md ${
                              submission.evaluation.isCorrect
                                ? "bg-green-100 border border-green-300 text-green-900"
                                : "bg-red-100 border border-red-300 text-red-900"
                            }`}
                          >
                            <h4 className="font-medium mb-2 text-gray-900">
                              Feedback:
                            </h4>
                            <p className="mb-2">
                              {submission.evaluation.feedback}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div className="bg-white bg-opacity-50 p-2 rounded">
                                <p className="font-medium text-gray-900">
                                  Time Complexity:
                                </p>
                                <p>{submission.evaluation.timeComplexity}</p>
                              </div>
                              <div className="bg-white bg-opacity-50 p-2 rounded">
                                <p className="font-medium text-gray-900">
                                  Space Complexity:
                                </p>
                                <p>{submission.evaluation.spaceComplexity}</p>
                              </div>
                            </div>
                            {submission.evaluation.optimizations.length > 0 && (
                              <div className="mt-3 bg-white bg-opacity-50 p-2 rounded">
                                <p className="font-medium text-gray-900">
                                  Optimization Suggestions:
                                </p>
                                <ul className="list-disc pl-4 mt-1">
                                  {submission.evaluation.optimizations.map(
                                    (opt, i) => (
                                      <li key={i}>{opt}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
