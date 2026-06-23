import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Force a check for the key at runtime
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "CRITICAL: API Key is entirely missing from process.env" }, { status: 500 });
    }

    // 2. Initialize inside the POST request
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "No image payload received by the server." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
      You are an elite municipal infrastructure analyst agent.
      Analyze the provided image of a civic issue (e.g., pothole, broken light, graffiti, leak).
      Return ONLY a JSON object with the following exact structure:
      {
        "title": "A short, precise title of the issue",
        "category": "One of: Roadway, Lighting, Water, Waste, Structural, Other",
        "severity": "One of: Low, Medium, High, Critical",
        "confidenceScore": "A percentage from 0 to 100",
        "estimatedBounty": "An integer between 100 and 1000",
        "aiDraftedDispatch": "A professional 2-sentence description ready to be sent to a municipal repair crew."
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
    console.error("🔥 REAL BACKEND ERROR:", error);
    // Send the actual error message to the frontend
    return NextResponse.json(
      { success: false, error: error.message || "Unknown Gemini API failure." }, 
      { status: 500 }
    );
  }
}