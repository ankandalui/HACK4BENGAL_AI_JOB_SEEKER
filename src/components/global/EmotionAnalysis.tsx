import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalysisData {
  confidence: number;
  confidenceHistory: number[];
  emotion: string;
  faceDetected: boolean;
}

const EmotionAnalysis = ({ analysisData }: { analysisData?: AnalysisData }) => {
  const getConfidenceColor = (confidence: any) => {
    if (confidence < 30) return "bg-red-500";
    if (confidence < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getChartData = () => {
    if (!analysisData?.confidenceHistory) return [];
    return analysisData.confidenceHistory.map((value, index) => ({
      time: index,
      confidence: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {analysisData ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Confidence Score</span>
                <span className="font-bold">
                  {analysisData.confidence.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={analysisData.confidence}
                className={`h-2 ${getConfidenceColor(analysisData.confidence)}`}
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Primary Emotion</h3>
                <p className="text-lg font-semibold capitalize">
                  {analysisData.emotion !== "unknown"
                    ? analysisData.emotion
                    : "No emotion detected"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Face Detection</h3>
                <p
                  className={`text-lg font-semibold ${
                    analysisData.faceDetected
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {analysisData.faceDetected ? "Detected" : "Not detected"}
                </p>
              </div>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    tick={false}
                    label={{ value: "Time", position: "insideBottom" }}
                  />
                  <YAxis domain={[0, 100]} width={35} />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
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
  );
};

export default EmotionAnalysis;
