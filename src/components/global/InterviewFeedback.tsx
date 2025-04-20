import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InterviewFeedbackProps {
  feedback?: string;
  stats?: {
    answersCount: number;
    avgConfidence: number;
    duration: string;
  };
  onNewInterview: () => void;
}

const InterviewFeedback = ({
  feedback,
  stats,
  onNewInterview,
}: InterviewFeedbackProps) => {
  const extractScoreFromFeedback = () => {
    if (!feedback) return "--";
    const scoreRegex = /(\d+(\.\d+)?)\s*\/\s*10/;
    const match = feedback.match(scoreRegex);
    return match ? match[1] : "--";
  };

  const formatFeedback = () => {
    if (!feedback) return "";
    return feedback
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/(\d+\.\s+[^:]+):/g, "<strong>$1:</strong>");
  };

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Interview Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Questions Answered:</span>
                    <span className="font-semibold">
                      {stats?.answersCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Average Confidence:</span>
                    <span className="font-semibold">
                      {stats?.avgConfidence
                        ? `${stats.avgConfidence.toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-semibold">
                      {stats?.duration || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall Score</CardTitle>
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
              <CardTitle className="text-lg">Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: `<p>${formatFeedback()}</p>`,
                  }}
                />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No feedback available
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.print()}>
              Print Feedback
            </Button>
            <Button onClick={onNewInterview}>Start New Interview</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewFeedback;
