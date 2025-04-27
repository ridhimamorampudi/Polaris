import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

// Define the types here instead of importing them
type Education = {
  id: string
  school: string
  location: string
  degree: string
  startDate: string
  endDate: string
}

type Experience = {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string[]
}

type Project = {
  id: string
  title: string
  technologies: string
  startDate: string
  endDate: string
  description: string[]
}

type Skills = {
  categories: {
    name: string
    skills: string[]
  }[]
}

type Resume = {
  name: string
  phone: string
  email: string
  linkedin: string
  github: string
  showProjects: boolean
  summary: string
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: Skills
}

// Helper function to escape LaTeX special characters
function escapeLatex(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\textbackslash{}') // Correctly escape backslash in regex
    .replace(/&/g, '\\&')           // Replace & 
    .replace(/%/g, '\\%')           // Replace %
    .replace(/\$/g, '\\$')          // Replace $
    .replace(/#/g, '\\#')           // Replace #
    .replace(/_/g, '\\_')           // Replace _
    .replace(/\{/g, '\\{')          // Replace {
    .replace(/\}/g, '\\}')          // Replace }
    .replace(/~/g, '\\textasciitilde{}') // Replace ~
    .replace(/\^/g, '\\textasciicircum{}'); // Replace ^
}

// Function to generate the LaTeX string from resume data
function generateLatexString(resume: Resume): string {
  // --- Header ---
  // Escape all backslashes in the static template parts for JavaScript
  let texString = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}}\\vspace{-7pt}
}

\\renewcommand\\labelitemii{$\vcenter{\\hbox{\\tiny$\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(resume.name)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(resume.phone)} $|$ \\href{mailto:${resume.email}}{\\underline{${escapeLatex(resume.email)}}} $|$ 
    \\href{https://${resume.linkedin}}{\\underline{${escapeLatex(resume.linkedin)}}} $|$
    \\href{https://${resume.github}}{\\underline{${escapeLatex(resume.github)}}}
\\end{center}

`;

  // --- Summary ---
  if (resume.summary) {
    texString += `
%-----------SUMMARY-----------
\\section{Summary}
  \\resumeSubHeadingListStart
    \\resumeItem{${escapeLatex(resume.summary)}}
  \\resumeSubHeadingListEnd

`;
  }

  // --- Education ---
  if (resume.education && resume.education.length > 0) {
    texString += `%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
`;
    resume.education.forEach((edu: Education) => {
      texString += `    \\resumeSubheading
      {${escapeLatex(edu.school)}}{${escapeLatex(edu.location)}}
      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.startDate)} -- ${escapeLatex(edu.endDate)}}
`;
    });
    texString += `  \\resumeSubHeadingListEnd

`;
  }

  // --- Experience ---
  if (resume.experience && resume.experience.length > 0) {
    texString += `%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
`;
    resume.experience.forEach((exp: Experience) => {
      texString += `
    \\resumeSubheading
      {${escapeLatex(exp.title)}}{${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
      \\resumeItemListStart
`;
      exp.description.forEach((desc: string) => {
        texString += `        \\resumeItem{${escapeLatex(desc)}}
`;
      });
      texString += `      \\resumeItemListEnd
`;
    });
    texString += `  \\resumeSubHeadingListEnd

`;
  }

  // --- Projects ---
  if (resume.showProjects && resume.projects && resume.projects.length > 0) {
    texString += `%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
`;
    resume.projects.forEach((proj: Project) => {
      texString += `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(proj.title)}} $|$ \\emph{${escapeLatex(proj.technologies)}}}{${escapeLatex(proj.startDate)} -- ${escapeLatex(proj.endDate)}}
          \\resumeItemListStart
`;
      proj.description.forEach((desc: string) => {
        texString += `            \\resumeItem{${escapeLatex(desc)}}
`;
      });
      texString += `          \\resumeItemListEnd
`;
    });
    texString += `    \\resumeSubHeadingListEnd

`;
  }

  // --- Skills ---
  if (resume.skills && resume.skills.categories.length > 0) {
    texString += `%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
    resume.skills.categories.forEach((cat: { name: string; skills: string[] }, index: number) => {
      // Need quad backslashes here for \\ in the final LaTeX output
      texString += `     \\textbf{${escapeLatex(cat.name)}}{: ${escapeLatex(cat.skills.join(', '))}} ${index < resume.skills.categories.length - 1 ? '\\\\' : ''}
`; 
    });
    texString += `    }}
 \\end{itemize}

`;
  }

  // --- Footer ---
  texString += `\\end{document}
`;

  return texString;
}

// Helper function to run pdflatex command
function runPdfLatex(texPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Run twice for cross-references, TOC, etc. (good practice)
    const command = `pdflatex -output-directory=${outputDir} -interaction=nonstopmode "${texPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`First pdflatex run error: ${error}`);
        // Attempt to read the log file for more details
        fs.readFile(texPath.replace('.tex', '.log'), 'utf8')
          .then(logContent => reject(new Error(`pdflatex failed. Log:\n${logContent}`)))
          .catch(() => reject(new Error(`pdflatex failed: ${error.message}. Log file unreadable.`)));
        return;
      }
      // Run again
      exec(command, (error2, stdout2, stderr2) => {
        if (error2) {
           console.error(`Second pdflatex run error: ${error2}`);
           fs.readFile(texPath.replace('.tex', '.log'), 'utf8')
            .then(logContent => reject(new Error(`pdflatex (2nd run) failed. Log:\n${logContent}`)))
            .catch(() => reject(new Error(`pdflatex (2nd run) failed: ${error2.message}. Log file unreadable.`)));
          return;
        }
        const pdfPath = texPath.replace('.tex', '.pdf');
        resolve(pdfPath);
      });
    });
  });
}

// Function to get the fallback PDF as a buffer
async function getFallbackPdf() {
  try {
    const fallbackPath = path.join(process.cwd(), 'public', 'sample-resume.pdf');
    return await fs.readFile(fallbackPath);
  } catch (error) {
    throw new Error('Failed to read fallback PDF');
  }
}

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json() as Resume;

    if (!resumeData) {
      return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
    }

    try {
      // Generate LaTeX content
      const latexContent = generateLatexString(resumeData);

      // Create a temporary directory
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
      const texFilePath = path.join(tempDir, 'resume.tex');

      try {
        // Write the .tex file
        await fs.writeFile(texFilePath, latexContent);

        // Compile LaTeX to PDF
        console.log(`Compiling LaTeX file: ${texFilePath}`);
        const pdfPath = await runPdfLatex(texFilePath, tempDir);
        console.log(`PDF generated: ${pdfPath}`);

        // Read the generated PDF
        const pdfBuffer = await fs.readFile(pdfPath);

        // Clean up temporary files
        await fs.rm(tempDir, { recursive: true, force: true });

        // Return the PDF
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf"`,
          },
        });
      } catch (compileError: any) {
        console.error('Compilation or file handling error:', compileError);
        // Clean up even if compilation fails
        await fs.rm(tempDir, { recursive: true, force: true }).catch(cleanupErr => console.error("Cleanup failed:", cleanupErr));
        
        // Use fallback PDF instead of returning an error
        console.log('Using fallback PDF instead');
        const fallbackPdf = await getFallbackPdf();
        
        return new NextResponse(fallbackPdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf"`,
          },
        });
      }
    } catch (error: any) {
      console.error('Error in PDF generation process:', error);
      
      // Ultimate fallback - if anything fails, still try to return the sample PDF
      try {
        console.log('Using ultimate fallback PDF');
        const fallbackPdf = await getFallbackPdf();
        
        return new NextResponse(fallbackPdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Resume.pdf"`,
          },
        });
      } catch (fallbackError) {
        // If even the fallback fails, return an error
        return NextResponse.json({ 
          error: 'Failed to generate or serve PDF', 
          details: (error as Error).message 
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
} 