import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Log the environment variable right before use
console.log("SERVER_LOG: GOOGLE_API_KEY value:", process.env.GOOGLE_API_KEY ? 'Exists' : 'MISSING or empty');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt, essay, wordCount } = await request.json();

    if (!prompt || !essay || !wordCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate word count
    const essayWordCount = essay.split(/\s+/).length;
    if (essayWordCount > wordCount) {
      return NextResponse.json(
        { error: `Essay exceeds word limit. Current: ${essayWordCount}, Limit: ${wordCount}` },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are a very strict expert college essay reviewer. Analyze the following essay and provide detailed feedback in the following JSON format:
            {
              "overall": {
                "score": number,
                "summary": "Brief overall assessment",
                "wordCount": ${essayWordCount},
                "wordLimit": ${wordCount},
                "wordCountCompliant": ${essayWordCount <= wordCount}
              },
              "feedback": [
                {
                  "type": "grammar|structure|tone|engagement|strength|weakness",
                  "severity": "high|medium|low",
                  "line": number,
                  "text": "The specific text being referenced",
                  "suggestion": "Specific suggestion for improvement",
                  "explanation": "Detailed explanation of the issue"
                }
              ],
              "highlights": [
                {
                  "type": "grammar|structure|tone|engagement|strength|weakness",
                  "start": number,
                  "end": number,
                  "text": "The highlighted text",
                  "suggestion": "Suggested improvement"
                }
              ],
              // Legacy format for backward compatibility
              "structure": "Analysis of essay structure and organization",
              "tone": "Analysis of writing tone and style",
              "grammar": "Analysis of grammar and technical writing",
              "emotionalEngagement": "Analysis of emotional impact and engagement",
              "strengths": ["List of key strengths"],
              "weaknesses": ["List of areas for improvement"]
            }
            
            Consider the essay prompt and word count in your analysis. Provide specific feedback with line numbers and text references.
            Focus on actionable improvements and highlight both strengths and areas for improvement.
            
            Essay Prompt: ${prompt}
            Word Count: ${essayWordCount}/${wordCount}
            
            Essay:
            ${essay}`
          }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from response');
    }
    
    const feedback = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Essay review error:', error);
    return NextResponse.json(
      { error: 'Failed to process essay review' },
      { status: 500 }
    );
  }
} 