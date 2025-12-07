import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// --- Helper Functions for "The Line Number Trick" ---

/**
 * Adds line numbers to the code for the AI context.
 * Format: "1: first line\n2: second line"
 */
function addLineNumbers(code: string): string {
    return code.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n');
}

/**
 * Removes line numbers from the code (if the AI hallucinates them in the output).
 */
function stripLineNumbers(code: string): string {
    return code.replace(/^\d+:\s/gm, '');
}

/**
 * Applies a list of patch operations to the original code.
 */
function applyPatches(originalCode: string, operations: any[]): string {
    const lines = originalCode.split(/\r?\n/);
    // Sort operations in reverse order (bottom up) to avoid index shifting issues
    operations.sort((a, b) => b.start_line - a.start_line);

    for (const op of operations) {
        const { op: type, start_line, end_line, content, search } = op;
        const startIdx = start_line - 1; // Convert 1-based to 0-based
        const endIdx = end_line ? end_line - 1 : startIdx;

        // Safety: Check bounds
        if (startIdx < 0 || startIdx > lines.length) {
            console.warn(`Patch out of bounds: Line ${start_line}`);
            continue;
        }

        // Safety: Verify Content (The "Crack")
        // We assume the AI might be slightly off, but if it provided 'search' text, we check it.
        if (search) {
            const targetLines = lines.slice(startIdx, endIdx + 1).join('\n');
            // Simple normalization for comparison (ignore whitespace differences)
            if (targetLines.trim().replace(/\s+/g, ' ') !== search.trim().replace(/\s+/g, ' ')) {
                console.warn(`Patch Safety Warning Line ${start_line}: Search Text Mismatch. Expected "${search}" found "${targetLines}"`);
                // TODO: Implement fallback search? For now, we continue but warn.
            }
        }

        if (type === 'replace') {
            // Remove old lines and splice in new lines
            // "content" usually comes without line numbers, but we strip just in case
            const newLines = stripLineNumbers(content).split(/\r?\n/);
            lines.splice(startIdx, (endIdx - startIdx) + 1, ...newLines);
        } else if (type === 'insert_after') {
            const newLines = stripLineNumbers(content).split(/\r?\n/);
            lines.splice(endIdx + 1, 0, ...newLines);
        } else if (type === 'delete') {
            lines.splice(startIdx, (endIdx - startIdx) + 1);
        }
    }

    return lines.join('\n');
}

export async function POST(req: NextRequest) {
    try {
        const { messages, systemPrompt, currentCode, projectId } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
        }

        const supabase = await createClient();

        // 1. Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        // If no user, we might still want to allow chat for demo? 
        // For now, let's assume auth is required for saving history.

        const lastMessage = messages[messages.length - 1];

        // 2. Save User Message
        if (projectId && user) {
            await supabase.from('chat_messages').insert({
                project_id: projectId,
                role: 'user',
                content: lastMessage.content
            });
        }

        // 3. Decorate Code with Line Numbers
        const codeWithLines = currentCode ? addLineNumbers(currentCode) : "No code provided.";

        // 4. Enhanced System Prompt
        const baseSystemPrompt = `
You are an expert LaTeX Resume Assistant.
You have access to the user's current LaTeX resume code, DECORATED WITH LINE NUMBERS.

CURRENT CODE (Line Numbers are for reference only):
${codeWithLines}

INSTRUCTIONS:
1. Analyze the user's request.
2. If the user asks a question, returns "message".
3. If the user asks for a CODE CHANGE, you must perform a SURGICAL EDIT.
   - DO NOT return the full file.
   - Return a "patch" response with a list of specific operations.
   - Use the LINE NUMBERS from the context to target your edits.

RESPONSE FORMATS:

Type "message":
{ "type": "message", "content": "Your helpful response." }

Type "patch" (For code changes):
{
  "type": "patch",
  "explanation": "Brief summary of what changed.",
  "operations": [
    {
      "op": "replace", 
      "start_line": 10,
      "end_line": 12, 
      "search": "exact string content at these lines for verification",
      "content": "new code to replace with" 
    },
    {
      "op": "insert_after",
      "start_line": 15, // Insert after this line
      "content": "new code to insert"
    },
    {
      "op": "delete",
      "start_line": 20,
      "end_line": 22,
      "search": "content to delete"
    }
  ]
}

CRITICAL RULES:
- "start_line" and "end_line" refer to the numbers in CURRENT CODE.
- When replacing, "content" should be the RAW LaTeX code (NO line numbers).
- JSON must be valid. Escape backslashes (e.g., "\\documentclass").
- CRITICAL for LaTeX: You MUST double-escape all backslashes in the JSON string "content".
  Example: To insert "\vspace{1pt}", you must write "content": "\\vspace{1pt}".
  Example: To insert "\textbf{Skills}", you must write "content": "\\textbf{Skills}".
  If you write "content": "\vspace", it will be invalid JSON. If you write "content": "vspace", it will look wrong.
- DO NOT strip existing backslashes from "search" or "content".
${systemPrompt || ""}
`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Convert messages to Gemini format (excluding the last one which is sent separately)
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: baseSystemPrompt }] },
                { role: "model", parts: [{ text: JSON.stringify({ type: "message", "content": "Ready. I will use line numbers for surgical edits." }) }] },
                ...history
            ]
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        console.log("--- GEMINI CHAT RESPONSE ---");
        console.log(text);
        console.log("----------------------------");

        try {
            let jsonResponse;
            const cleanText = text.trim();
            try {
                jsonResponse = JSON.parse(cleanText);
            } catch (e) {
                // Try stripping markdown
                const noMarkdown = cleanText.replace(/^```(json)?\s*|\s*```$/gi, '').trim();
                try {
                    jsonResponse = JSON.parse(noMarkdown);
                } catch (e2) {
                    // Try finding { and }
                    const firstBrace = cleanText.indexOf('{');
                    const lastBrace = cleanText.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        jsonResponse = JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
                    } else {
                        throw e; // Original error if all fails
                    }
                }
            }

            // 5. Save AI Response
            let aiMessageId = null;
            if (projectId && user) {
                // Determine content to save (summary if it's a code update)
                const saveContent = jsonResponse.type === 'patch'
                    ? `I've updated your resume code. ${jsonResponse.explanation || ''}`
                    : (jsonResponse.content || "I didn't understand that.");

                const { data: aiMsg, error: aiError } = await supabase.from('chat_messages').insert({
                    project_id: projectId,
                    role: 'assistant',
                    content: saveContent
                }).select().single();

                if (aiMsg) aiMessageId = aiMsg.id;
            }

            // 6. Handle Patch Application Logic
            const responseType = jsonResponse.type?.toLowerCase().trim();
            console.log("AI Response Type:", responseType);

            if (responseType === 'patch') {
                console.log("Applying Patch Operations:", jsonResponse.operations?.length);

                if (!jsonResponse.operations || !Array.isArray(jsonResponse.operations)) {
                    console.error("Patch response missing 'operations' array");
                    return NextResponse.json({ type: "message", content: "Error: AI generated an invalid patch structure." });
                }

                const updatedCode = applyPatches(currentCode, jsonResponse.operations);

                // 7. Save Version History (Patch Snapshot)
                let newVersion = null;
                if (projectId && aiMessageId && user) {
                    const { data: vData, error: vError } = await supabase.from('resume_versions').insert({
                        project_id: projectId,
                        chat_message_id: aiMessageId,
                        patch_content: jsonResponse.operations,
                        full_code: updatedCode
                    }).select().single();

                    if (vData) newVersion = vData;
                    else console.error("Failed to fetch new version:", vError);
                }

                // Return as a standard "update_code" response for the frontend
                return NextResponse.json({
                    type: "update_code",
                    content: updatedCode,
                    explanation: jsonResponse.explanation,
                    message_id: aiMessageId,
                    version: newVersion // Return full version object
                });
            }

            return NextResponse.json(jsonResponse);

        } catch (e: any) {
            console.error("Failed to parse AI JSON response:", e.message);
            console.error("Raw Text:", text);
            return NextResponse.json({ type: "message", content: text });
        }

    } catch (error: any) {
        console.error("Error in AI chat:", error);
        return NextResponse.json(
            { error: `Failed to process chat request: ${error.message}` },
            { status: 500 }
        );
    }
}
