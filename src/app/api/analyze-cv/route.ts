// api/analyze-cv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVAnalysisResult } from "../../../../types";

// Use server-side environment variable
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing Gemini API key in server environment");
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // If API key is missing, return default questions
    if (!apiKey) {
      return NextResponse.json(getDefaultQuestions());
    }

    // Fetch and analyze the CV
    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        console.error(
          `Failed to fetch PDF: ${response.status} ${response.statusText}`
        );
        return NextResponse.json(getDefaultQuestions());
      }

      // Use the correct model name: gemini-1.5-flash
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this CV and generate 3 coding questions based on the candidate's skills. 
      Format the response as JSON with the following structure:
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

      try {
        const parsedResponse = JSON.parse(
          generatedResponse.text()
        ) as CVAnalysisResult;
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return NextResponse.json(getDefaultQuestions());
      }
    } catch (aiError) {
      console.error("Error with Gemini API:", aiError);
      return NextResponse.json(getDefaultQuestions());
    }
  } catch (error) {
    console.error("Error in analyze-cv API route:", error);
    return NextResponse.json(
      { error: "Failed to analyze CV" },
      { status: 500 }
    );
  }
}

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
