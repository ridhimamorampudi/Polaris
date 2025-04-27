import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the PDF file
    const filePath = path.join(process.cwd(), 'public', 'sample-resume.pdf');
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Return the file as a response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Error serving PDF file' },
      { status: 500 }
    );
  }
} 