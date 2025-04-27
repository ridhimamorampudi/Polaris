import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(req: Request) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json(
      { error: 'Google AI API key is not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt, essay } = await req.json()

    if (!prompt || !essay) {
      return NextResponse.json(
        { error: 'Both prompt and essay are required' },
        { status: 400 }
      )
    }

    // Construct the analysis prompt
    const analysisPrompt = `
      As a college admissions expert, analyze this college application essay:

      PROMPT:
      ${prompt}

      ESSAY:
      ${essay}

      Provide a comprehensive analysis in the following format:
      1. Overall assessment (2-3 sentences evaluating how well the essay responds to the prompt)
      2. List of 3-4 key strengths
      3. List of 2-3 areas for improvement
      4. 2-3 specific suggestions for improvement, each with:
         - Original text or concept
         - Improved version or specific advice

      Focus on:
      - How well the essay answers the prompt
      - Personal story and authenticity
      - Structure and flow
      - Specific details and examples
      - Voice and tone
      - Impact and memorability

      Format the response as JSON with these keys:
      {
        "overall": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "suggestions": [{"original": "string", "improved": "string"}]
      }
    `

    // Get the response from Gemini
    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const text = response.text()

    try {
      // Parse the JSON response
      const feedback = JSON.parse(text)
      return NextResponse.json(feedback)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.log('Raw response:', text)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Essay review error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze essay' },
      { status: 500 }
    )
  }
} 