import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { imageBase64, mimeType, originalIssue } = body;

    if (!imageBase64 || !originalIssue) {
      return NextResponse.json({ success: false, error: "Missing payload" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" }
    });

    // The core prompt that acts as our Autonomous Inspector
    const systemPrompt = `
      You are an elite AI Municipal Inspector. 
      A user has claimed to have fixed the following infrastructure issue:
      - Title: ${originalIssue.title}
      - Category: ${originalIssue.category}
      - Expected Fix: ${originalIssue.description}

      Analyze the provided image of the "fixed" area. Does the image show that this specific type of issue has been resolved (e.g., fresh asphalt for a pothole, a working light, clean wall instead of graffiti)?
      
      Return ONLY a JSON object with this exact structure:
      {
        "isVerified": true or false,
        "confidenceScore": "percentage from 0 to 100",
        "inspectorNotes": "A 1-2 sentence professional explanation of what you see in the image and why you are approving or rejecting the claim."
      }
    `;

    const imagePart = {
      inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" },
    };

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();
    const structuredData = JSON.parse(responseText);

    return NextResponse.json({ success: true, data: structuredData });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}