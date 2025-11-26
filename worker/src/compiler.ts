import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import execa from 'execa';
import { randomUUID } from 'crypto';

const WORK_DIR = path.join(process.cwd(), 'temp_work');

// Ensure work directory exists
fs.ensureDirSync(WORK_DIR);

export async function compileProject(jobId: string, zipUrl: string): Promise<string> {
    const runId = randomUUID();
    const runDir = path.join(WORK_DIR, runId);

    try {
        console.log(`[${jobId}] Starting compilation in ${runDir}`);
        await fs.ensureDir(runDir);

        // 1. Download Zip
        console.log(`[${jobId}] Downloading zip from ${zipUrl}`);
        const response = await fetch(zipUrl);
        if (!response.ok) throw new Error(`Failed to download zip: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const zipPath = path.join(runDir, 'project.zip');
        await fs.writeFile(zipPath, Buffer.from(arrayBuffer));

        // 2. Extract Zip
        console.log(`[${jobId}] Extracting zip...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(runDir, true);

        // 2.5 Find Project Root (Handle nested folder from zip)
        let projectRoot = runDir;
        const items = await fs.readdir(runDir);
        // Filter out the zip file itself
        const contentItems = items.filter(i => i !== 'project.zip');

        if (contentItems.length === 1) {
            const potentialRoot = path.join(runDir, contentItems[0]);
            if ((await fs.stat(potentialRoot)).isDirectory()) {
                console.log(`[${jobId}] Detected nested project root: ${contentItems[0]}`);
                projectRoot = potentialRoot;
            }
        }

        // 3. Compile
        console.log(`[${jobId}] Compiling in ${projectRoot}...`);

        // Check if main.tex exists (or find any .tex)
        const files = await fs.readdir(projectRoot);
        const texFile = files.find(f => f.endsWith('.tex'));

        if (!texFile) {
            throw new Error(`No .tex file found in ${projectRoot}`);
        }

        // Run latexmk
        // -pdf: Generate PDF
        // -interaction=nonstopmode: Don't stop on errors
        // -outdir=.: Output to same directory
        try {
            console.log(`[${jobId}] Running latexmk on ${texFile}...`);
            await execa('latexmk', ['-pdf', '-interaction=nonstopmode', '-outdir=.', texFile!], { cwd: projectRoot });
        } catch (e: any) {
            console.error(`[${jobId}] latexmk failed:`, e.message);
            if (e.stdout) console.error(`[${jobId}] stdout:\n`, e.stdout);
            if (e.stderr) console.error(`[${jobId}] stderr:\n`, e.stderr);
            throw new Error('Compilation failed');
        }

        const pdfPath = path.join(projectRoot, texFile!.replace('.tex', '.pdf'));

        if (!await fs.pathExists(pdfPath)) {
            throw new Error('PDF was not generated');
        }

        console.log(`[${jobId}] PDF generated at ${pdfPath}`);

        // 4. Return result path
        return pdfPath;

    } catch (error) {
        console.error(`[${jobId}] Compilation failed:`, error);
        throw error;
    }
}

export async function cleanup(runDir: string) {
    await fs.remove(runDir);
}
