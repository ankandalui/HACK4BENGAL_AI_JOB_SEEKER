// api.ts
import { API_URL } from "../utils/uri";
import { AnalysisData, InterviewSession } from "../../types";

// Capture frame and send for analysis
export const captureAndAnalyze = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  sessionId: string | undefined
): Promise<AnalysisData | null> => {
  if (!videoRef.current || !canvasRef.current || !sessionId) return null;

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

    const response = await fetch(`${API_URL}/analyze-image/${sessionId}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error in analysis:", err);
    return null;
  }
};

// Start interview session
export const startInterview = async (
  jobRole: string,
  cvFile: File | null,
  duration: number
): Promise<{
  success: boolean;
  data?: {
    session_id: string;
    first_question?: string;
  };
  error?: string;
}> => {
  try {
    if (!jobRole || !cvFile || !duration) {
      return {
        success: false,
        error: "Please fill all fields before starting the interview",
      };
    }

    const formData = new FormData();
    formData.append("cv_file", cvFile);
    formData.append("job_role", jobRole);
    formData.append("duration", duration.toString());

    const response = await fetch(`${API_URL}/start-interview`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to start interview");
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

// Check interview status
export const checkInterviewStatus = async (
  sessionId: string
): Promise<{
  active: boolean;
  time_remaining?: number;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/check-status/${sessionId}`);
    return await response.json();
  } catch (err) {
    console.error("Error checking interview status:", err);
    return {
      active: true,
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

// Get next interview question
export const getNextQuestion = async (
  sessionId: string
): Promise<{
  success: boolean;
  question?: string;
  error?: string;
}> => {
  try {
    const timestamp = Date.now(); // Add timestamp to prevent caching
    const response = await fetch(
      `${API_URL}/get-question/${sessionId}?t=${timestamp}`,
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get question");
    }

    const data = await response.json();
    return {
      success: true,
      question: data.question,
    };
  } catch (err) {
    return {
      success: false,
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

// Submit answer
export const submitAnswer = async (
  sessionId: string,
  answer: string,
  question: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    if (!sessionId || !question || !answer.trim()) {
      return {
        success: false,
        error: "Please provide an answer before submitting",
      };
    }

    const response = await fetch(`${API_URL}/submit-answer/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: answer.trim(),
        question: question,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to submit answer");
    }

    const responseData = await response.json();
    return {
      success: responseData.success,
    };
  } catch (err) {
    return {
      success: false,
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

// End interview early
export const endInterview = async (
  sessionId: string,
  answersCount: number
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // First, let's verify all answers were properly recorded on the backend
    const verifyResponse = await fetch(
      `${API_URL}/check-qa-count/${sessionId}`
    );
    const verifyData = await verifyResponse.json();

    // If the backend has fewer QA pairs than our frontend, something is wrong
    if (verifyData.qa_count < answersCount) {
      return {
        success: false,
        error: `Answer count mismatch: Frontend has ${answersCount}, backend has ${verifyData.qa_count}`,
      };
    }

    // Now end the interview
    const response = await fetch(`${API_URL}/end-interview/${sessionId}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to end interview");
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

// Get interview feedback
export const getFeedback = async (
  sessionId: string
): Promise<{
  success: boolean;
  feedback?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/get-feedback/${sessionId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get feedback");
    }

    const data = await response.json();
    return {
      success: true,
      feedback: data.feedback,
    };
  } catch (err) {
    return {
      success: false,
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

// Check API connectivity
export const checkAPIConnectivity = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}`);

    if (response.ok) {
      return { success: true };
    } else {
      return {
        success: false,
        error:
          "Cannot connect to the interview server. Please try again later.",
      };
    }
  } catch (err) {
    return {
      success: false,
      error:
        "Cannot connect to the interview server. Please check your network connection.",
    };
  }
};
