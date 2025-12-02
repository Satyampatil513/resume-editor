import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import { randomUUID } from 'crypto';

const WORK_DIR = path.join(process.cwd(), 'temp_work');

// Ensure work directory exists
fs.ensureDirSync(WORK_DIR);

export interface SyntaxError {
    line: number;
    column: number;
    code: string;
    message: string;
    file: string;
}

export async function checkSyntax(jobId: string, latexContent: string): Promise<SyntaxError[]> {
    const runId = randomUUID();
    const runDir = path.join(WORK_DIR, runId);

    try {
        console.log(`[${jobId}] Starting syntax check in ${runDir}`);
        await fs.ensureDir(runDir);

        const texPath = path.join(runDir, 'main.tex');
        await fs.writeFile(texPath, latexContent);

        // Run chktex
        // -q: Quiet mode
        // -v0: Output format (0 = standard)
        // -f: Output format string
        // We use a custom format to make parsing easier: %l:%c:%k:%m:%f
        // %l: line, %c: col, %k: warning number, %m: message, %f: filename
        const format = '%l|%c|%k|%m|%f\n';

        try {
            const { stdout } = await execa('chktex', ['-q', '-v0', `-f${format}`, texPath], { cwd: runDir });
            return parseChktexOutput(stdout);
        } catch (e: any) {
            // chktex returns exit code 1 if errors are found, but we still want the output
            if (e.stdout) {
                return parseChktexOutput(e.stdout);
            }
            console.error(`[${jobId}] chktex failed:`, e.message);
            throw new Error('Syntax check failed');
        }

    } catch (error) {
        console.error(`[${jobId}] Syntax check failed:`, error);
        throw error;
    } finally {
        await fs.remove(runDir);
    }
}

function parseChktexOutput(output: string): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const lines = output.trim().split('\n');

    for (const line of lines) {
        if (!line.trim()) continue;

        const parts = line.split('|');
        if (parts.length >= 5) {
            errors.push({
                line: parseInt(parts[0], 10),
                column: parseInt(parts[1], 10),
                code: parts[2],
                message: parts[3],
                file: parts[4]
            });
        }
    }

    return errors;
}
