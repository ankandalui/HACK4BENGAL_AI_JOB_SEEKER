import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CVAnalysisResult,
  CodeEvaluation,
  CodingQuestion,
  TestCase,
} from "../../types";

// Change from NEXT_PUBLIC_GEMINI_API_KEY to GEMINI_API_KEY - API keys should be server-side only
const apiKey =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API key");
}

// Initialize the Gemini API client with the correct model name
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to extract JSON from text that might contain markdown formatting
function extractJsonFromText(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no code blocks found, return the original text
  return text;
}

export const analyzeCV = async (fileUrl: string): Promise<CVAnalysisResult> => {
  try {
    // Fetch the PDF content from the URL
    const response = await fetch(fileUrl);

    // Check if the response is ok before proceeding
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
    }

    // For PDF files, we need to handle as binary data, not text
    const pdfBuffer = await response.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    try {
      // Use the correct model name: gemini-1.5-flash
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this CV and generate 3 coding questions based on the candidate's skills. 
      Return ONLY a JSON object with no markdown formatting, backticks, or any explanatory text.
      The JSON should have this structure:
      {
        "skillLevel": "beginner|intermediate|advanced",
        "questions": [
          {
            "id": "unique_id",
            "title": "question_title",
            "description": "detailed_description",
            "difficulty": "easy|medium|hard",
            "timeLimit": minutes_as_number,
            "testCases": [
              {
                "input": "example_input",
                "expectedOutput": "expected_output"
              }
            ],
            "starterCode": "// Function signature or starter code here"
          }
        ]
      }`;

      const result = await model.generateContent([
        { text: `This is a CV for analysis: ${fileUrl}` },
        { text: prompt },
      ]);

      const generatedResponse = await result.response;
      const responseText = generatedResponse.text();
      console.log("Raw API response:", responseText);

      // Extract JSON from text if it contains markdown formatting
      const jsonText = extractJsonFromText(responseText);
      console.log("Extracted JSON:", jsonText);

      try {
        const parsedResponse = JSON.parse(jsonText) as CVAnalysisResult;
        // Validate the structure of the response
        if (
          !parsedResponse.questions ||
          !Array.isArray(parsedResponse.questions) ||
          parsedResponse.questions.length === 0
        ) {
          throw new Error("Invalid response structure");
        }
        return parsedResponse;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Fallback to default questions if parsing fails
        return getDefaultQuestions();
      }
    } catch (aiError) {
      console.error("Error with Gemini API:", aiError);
      // Fallback to default questions if AI analysis fails
      return getDefaultQuestions();
    }
  } catch (error) {
    console.error("Error analyzing CV:", error);
    // Fallback to default questions for any error
    return getDefaultQuestions();
  }
};

// Provide default questions as a fallback
function getDefaultQuestions(): CVAnalysisResult {
  return {
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
}

export const evaluateCode = async (
  code: string,
  question: CodingQuestion,
  testCases: TestCase[]
): Promise<CodeEvaluation> => {
  try {
    // Use the correct model name: gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Evaluate this code solution for the following question:
    Question: ${question.title}
    Description: ${question.description}
    
    Code:
    ${code}
    
    Test Cases:
    ${JSON.stringify(testCases, null, 2)}
    
    Return ONLY a JSON object with no markdown formatting, backticks, or any explanatory text.
    The JSON should have this structure:
    {
      "isCorrect": boolean,
      "timeComplexity": "string",
      "spaceComplexity": "string",
      "optimizations": ["string array of optimization suggestions"],
      "feedback": "detailed feedback string",
      "errors": ["string array of errors if any"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Extract JSON from text if it contains markdown formatting
    const jsonText = extractJsonFromText(responseText);

    try {
      return JSON.parse(jsonText) as CodeEvaluation;
    } catch (parseError) {
      console.error("Error parsing evaluation response:", parseError);
      // Fallback evaluation if parsing fails
      return {
        isCorrect: false,
        timeComplexity: "Unknown",
        spaceComplexity: "Unknown",
        optimizations: ["Consider refactoring your code for clarity"],
        feedback:
          "There was an issue evaluating your code. Please check for syntax errors.",
        errors: ["Evaluation error"],
      };
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    // Return a fallback evaluation
    return {
      isCorrect: false,
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      optimizations: ["Try simplifying your solution"],
      feedback: "There was an error evaluating your code. Please try again.",
      errors: ["Evaluation service error"],
    };
  }
};
