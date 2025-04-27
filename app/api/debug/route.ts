import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    // Result object
    const result: any = {
      system: {
        platform: os.platform(),
        release: os.release(),
        totalmem: os.totalmem(),
        freemem: os.freemem()
      },
      checks: {}
    };

    // Check if pdflatex is installed
    try {
      const pdflatexPromise = new Promise((resolve) => {
        exec('which pdflatex', (error, stdout, stderr) => {
          if (error || stderr) {
            resolve({ installed: false, error: error?.message || stderr });
          } else {
            resolve({ installed: true, path: stdout.trim() });
          }
        });
      });
      
      result.checks.pdflatex = await pdflatexPromise;
      
      // If pdflatex is installed, test a simple compilation
      if (result.checks.pdflatex.installed) {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'debug-'));
        const testTexFile = path.join(tempDir, 'test.tex');
        
        // Simple LaTeX file
        const simpleLatex = `\\documentclass{article}
\\begin{document}
Hello World!
\\end{document}`;
        
        await fs.writeFile(testTexFile, simpleLatex);
        
        const compilePromise = new Promise((resolve) => {
          exec(`pdflatex -output-directory=${tempDir} -interaction=nonstopmode "${testTexFile}"`, (error, stdout, stderr) => {
            if (error) {
              resolve({
                success: false,
                error: error.message,
                stdout: stdout,
                stderr: stderr
              });
            } else {
              resolve({
                success: true,
                path: testTexFile.replace('.tex', '.pdf')
              });
            }
          });
        });
        
        result.checks.compilation = await compilePromise;
        
        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (error: any) {
      result.checks.pdflatex = {
        error: `Failed to check pdflatex: ${error.message}`
      };
    }
    
    // Check for the sample PDF file
    try {
      const pdfPath = path.join(process.cwd(), 'public', 'sample-resume.pdf');
      const stat = await fs.stat(pdfPath);
      result.checks.samplePdf = {
        exists: true,
        size: stat.size,
        isFile: stat.isFile()
      };
    } catch (error) {
      result.checks.samplePdf = {
        exists: false,
        error: 'Sample PDF file not found'
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Debug check failed: ${error.message}` },
      { status: 500 }
    );
  }
} 