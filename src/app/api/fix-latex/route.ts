import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { code, logs } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        if (!code || !logs) {
            return NextResponse.json(
                { error: "Both 'code' and 'logs' are required" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `
You are an expert LaTeX debugger.
The following LaTeX code failed to compile.
Here are the error logs from pdflatex:

${logs}

---
BROKEN LATEX CODE:
${code}
---

Your task is to FIX the LaTeX code so it compiles correctly.
1. Analyze the error log to understand the problem.
   - Look specifically for "Illegal parameter number" errors which often mean an unescaped # character in a URL or text.
   - Look for "Undefined control sequence" or missing packages.
2. Fix the code.
   - Ensure all # characters in text or URLs are escaped as \\# (unless they are actual macro parameters).
   - CRITICAL: JSON String Escaping Rules:
     - For LaTeX commands (e.g., \documentclass), use STANDARD JSON escaping: "\\documentclass" (one backslash in the string = two in JSON).
     - DO NOT use double-escaping like "\\\\documentclass" (this will print literal backslashes).
     - For Newlines, use standard JSON escape: "\\n".
   - CRITICAL: The resume MUST fit on ONE page. If the content is too long, you MUST adjust vertical spacing (\\vspace), reduce margins, or slightly reduce font size to make it fit. Do NOT remove content, just compress the layout.
3. Return a JSON object with the following structure:
{
    "fixedCode": "THE_FULL_CORRECTED_LATEX_CODE_HERE"
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("--- GEMINI FIX-LATEX RESPONSE ---");
        console.log(text);
        console.log("---------------------------------");

        try {
            const jsonResponse = JSON.parse(text);
            console.log("Parsed JSON:", jsonResponse);
            return NextResponse.json({ fixedCode: jsonResponse.fixedCode });
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", text);
            return NextResponse.json(
                { error: "Failed to parse AI response" },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Error in fix-latex API:", error);
        return NextResponse.json(
            { error: `Failed to fix LaTeX: ${error.message}` },
            { status: 500 }
        );
    }
}
