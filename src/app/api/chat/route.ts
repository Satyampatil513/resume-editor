import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages, systemPrompt, currentCode } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        // Enhanced System Prompt
        const baseSystemPrompt = `
You are an expert LaTeX Resume Assistant.
You have access to the user's current LaTeX resume code.

CURRENT CODE:
${currentCode || "No code provided."}

INSTRUCTIONS:
1. Analyze the user's request.
2. If the user asks a question, explains something, or wants advice, return a JSON response with type "message":
   { "type": "message", "content": "Your helpful response here." }

3. If the user asks to CHANGE, EDIT, ADD, REMOVE, or FIX anything in the resume (e.g., "Make the header blue", "Add a skill", "Fix the typo"), you MUST:
   - Edit the CURRENT CODE to satisfy the request.
   - CRITICAL: The resume MUST fit on ONE page. If your changes might push content to a second page, you MUST adjust vertical spacing (\\vspace), reduce margins, or slightly reduce font size to make it fit. Do NOT remove content, just compress the layout.
   - CRITICAL: JSON String Escaping Rules:
     - For LaTeX commands (e.g., \documentclass), use STANDARD JSON escaping: "\\documentclass" (one backslash in the string = two in JSON).
     - DO NOT use double-escaping like "\\\\documentclass".
     - For Newlines, use standard JSON escape: "\\n".
   - Return a JSON response with type "update_code":
   { "type": "update_code", "content": "THE_FULL_UPDATED_LATEX_CODE", "explanation": "Briefly explain what you changed." }

4. IMPORTANT: If the user request implies a code change, DO NOT just explain how to do it. DO IT. Return "update_code".

5. ALWAYS return valid JSON.
${systemPrompt || ""}
`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: baseSystemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: JSON.stringify({ type: "message", "content": "Understood. I am ready to assist with your LaTeX resume." }) }]
                },
                ...history
            ]
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        console.log("--- GEMINI CHAT RESPONSE ---");
        console.log(text);
        console.log("----------------------------");

        // Parse the JSON response
        try {
            const jsonResponse = JSON.parse(text);
            console.log("AI Response Parsed Type:", jsonResponse.type); // Debug log
            return NextResponse.json(jsonResponse);
        } catch (e) {
            console.error("Failed to parse AI JSON response:", text);
            // Fallback
            return NextResponse.json({ type: "message", content: text });
        }

    } catch (error: any) {
        console.error("Error in AI chat:", error);
        return NextResponse.json(
            {
                error: `Failed to process chat request: ${error.message}`,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
