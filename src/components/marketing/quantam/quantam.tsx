"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Quantum() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [started, setStarted] = useState(false);

  const handleStartInterview = async () => {
    if (!file || !jobRole) {
      alert("Please upload your CV and enter a job role.");
      return;
    }

    const formData = new FormData();
    formData.append("cv", file);
    formData.append("job_role", jobRole);
    formData.append("duration", "30");

    const res = await fetch("http://127.0.0.1:5000/api/start-interview", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (res.ok) {
      setStarted(true);
      fetchQuestion();
    } else {
      alert("Failed to start interview");
    }
  };

  const fetchQuestion = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/question", {
      credentials: "include",
    });

    const data = await res.json();
    setQuestion(data.question);
  };

  const handleAnswerSubmit = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ answer }),
    });

    if (res.ok) {
      setAnswer("");
      fetchQuestion();
    } else {
      alert("Error submitting answer");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 space-y-4">
      {!started ? (
        <>
          <div>
            <Label>Upload CV (PDF)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Label>Job Role</Label>
            <Input
              placeholder="e.g. Data Scientist"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
          </div>
          <Button onClick={handleStartInterview}>Start Interview</Button>
        </>
      ) : (
        <div>
          <h2 className="text-xl font-semibold">Question:</h2>
          <p className="mb-4">{question}</p>
          <Textarea
            placeholder="Your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button className="mt-2" onClick={handleAnswerSubmit}>
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
}
