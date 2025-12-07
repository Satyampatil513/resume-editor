import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// --- Helper Functions (Shared Logic) ---
function addLineNumbers(code: string): string {
    return code.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n');
}

function stripLineNumbers(code: string): string {
    return code.replace(/^\d+:\s/gm, '');
}

function applyPatches(originalCode: string, operations: any[]): string {
    const lines = originalCode.split('\n');
    operations.sort((a, b) => b.start_line - a.start_line);

    for (const op of operations) {
        const { op: type, start_line, end_line, content, search } = op;
        const startIdx = start_line - 1;
        const endIdx = end_line ? end_line - 1 : startIdx;

        if (startIdx < 0 || startIdx > lines.length) continue;

        if (search) {
            const targetLines = lines.slice(startIdx, endIdx + 1).join('\n');
            // Simple safety check - allow loose whitespace matching
            if (targetLines.trim().replace(/\s+/g, ' ') !== search.trim().replace(/\s+/g, ' ')) {
                console.warn(`Patch Safety Warning Line ${start_line}: Search Text Mismatch. Expected "${search}" found "${targetLines}"`);
                // Proceeding cautiously - in fix-latex we might want to trust line numbers more if search fails slightly
                // But for now, let's keep it strict or maybe fall back to full rewrite if we implemented that.
                // We'll proceed but log it.
            }
        }

        if (type === 'replace') {
            const newLines = stripLineNumbers(content).split('\n');
            lines.splice(startIdx, (endIdx - startIdx) + 1, ...newLines);
        } else if (type === 'insert_after') {
            const newLines = stripLineNumbers(content).split('\n');
            lines.splice(endIdx + 1, 0, ...newLines);
        } else if (type === 'delete') {
            lines.splice(startIdx, (endIdx - startIdx) + 1);
        }
    }
    return lines.join('\n');
}

export async function POST(req: NextRequest) {
    try {
        const { code, logs } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
        }
        if (!code || !logs) {
            return NextResponse.json({ error: "Both 'code' and 'logs' are required" }, { status: 400 });
        }

        // 1. Decorate Code
        const codeWithLines = addLineNumbers(code);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // 2. Enhanced Prompt
        const prompt = `
You are an expert LaTeX debugger.
The following LaTeX code failed to compile.
Here are the error logs from pdflatex:
---
${logs}
---

BROKEN LATEX CODE (Line Numbers added for reference):
${codeWithLines}

TASK:
Fix the LaTeX code so it compiles. 
Perform SURGICAL EDITS (Patches) using the line numbers.

COMMON FIXES:
- Escape '#' in text/URL: change '#' to '\\#'.
- Escape '_': change '_' to '\\_'.
- Fix undefined control sequences.

RESPONSE FORMAT:
{
  "type": "patch",
  "explanation": "Briefly explain the fix.",
  "operations": [
    {
      "op": "replace",
      "start_line": 50,
      "end_line": 50,
      "search": "github.com/user#name",
      "content": "github.com/user\#name"
    }
  ]
}

If the file is completely broken and needs a full rewrite, you MAY return:
{ "type": "rewrite", "fixedCode": "FULL_CODE_HERE" }

CRITICAL RULES:
- Use double backslashes for LaTeX commands in JSON strings: "\\item".
- "content" must be raw LaTeX (no line numbers).
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        console.log("--- GEMINI FIX-LATEX RESPONSE ---");
        console.log(text);
        console.log("---------------------------------");

        try {
            const jsonResponse = JSON.parse(text);

            if (jsonResponse.type === 'patch') {
                console.log("Applying Fix Patch:", jsonResponse.operations.length, "ops");
                const fixedCode = applyPatches(code, jsonResponse.operations);
                return NextResponse.json({ fixedCode });
            } else if (jsonResponse.fixedCode) {
                // Fallback or explicit rewrite
                console.log("Applying Full Rewrite");
                return NextResponse.json({ fixedCode: jsonResponse.fixedCode });
            }

            return NextResponse.json({ fixedCode: code }); // Fallback: return original if unsure

        } catch (e) {
            console.error("Failed to parse Gemini JSON:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Error in fix-latex API:", error);
        return NextResponse.json(
            { error: `Failed to fix LaTeX: ${error.message}` },
            { status: 500 }
        );
    }
}
