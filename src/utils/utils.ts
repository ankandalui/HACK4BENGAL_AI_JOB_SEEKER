// utils.ts
import { EmotionScore, ChartDataPoint, AnalysisData } from "../../types";
import { API_URL } from "../utils/uri";

// Format time remaining for display
export const formatTimeRemaining = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Get color for confidence level
export const getConfidenceColor = (confidence: number): string => {
  if (confidence < 30) return "bg-red-500";
  if (confidence < 60) return "bg-yellow-500";
  return "bg-green-500";
};

// Get color for emotion type
export const getEmotionColor = (emotion: string): string => {
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
export const getChartData = (
  analysisData: AnalysisData | null
): ChartDataPoint[] => {
  if (!analysisData?.confidenceHistory) return [];
  return analysisData.confidenceHistory.map((value, index) => ({
    time: index,
    confidence: value,
  }));
};

// Get sorted emotion scores
export const getEmotionScores = (
  analysisData: AnalysisData | null
): EmotionScore[] => {
  if (!analysisData?.emotionScores) return [];
  return Object.entries(analysisData.emotionScores)
    .map(([emotion, score]) => ({ emotion, score }))
    .sort((a, b) => b.score - a.score);
};

// Extract score from feedback
export const extractScoreFromFeedback = (feedback: string | null): string => {
  if (!feedback) return "--";

  const scoreRegex = /(\d+(\.\d+)?)\s*\/\s*10/;
  const match = feedback.match(scoreRegex);
  return match ? match[1] : "--";
};

// Format feedback for display
export const formatFeedback = (feedback: string | null): string => {
  if (!feedback) return "";

  return feedback
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/(\d+\.\s+[^:]+):/g, "<strong>$1:</strong>");
};
