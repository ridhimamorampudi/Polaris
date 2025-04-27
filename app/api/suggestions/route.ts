import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Define types for our data
interface Interest {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface CurrentActivity {
  name: string;
  type: 'club' | 'leadership' | 'internship' | 'competition';
  description: string;
}

interface Suggestion {
  name: string;
  type: 'club' | 'leadership' | 'internship' | 'competition';
  description: string;
  technologies?: string[];
  spikePotential: boolean;
  spikeExplanation?: string;
}

// Valid interest levels and activity types
const VALID_INTEREST_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const VALID_ACTIVITY_TYPES = ['club', 'leadership', 'internship', 'competition'] as const;

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
};

// Simple in-memory rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Sample data for suggestions (in a real app, this would come from a database)
const SUGGESTIONS_DATA: Record<string, Suggestion[]> = {
  'computer-science': [
    {
      name: 'Open Source Contribution',
      type: 'internship',
      description: 'Contribute to popular open source projects to build real-world experience',
      technologies: ['Git', 'GitHub', 'TypeScript', 'React'],
      spikePotential: true,
      spikeExplanation: 'Focus on a specific area like web development or machine learning. Build a portfolio of contributions to showcase expertise.'
    },
    {
      name: 'Hackathon Participation',
      type: 'competition',
      description: 'Join hackathons to build projects and network with industry professionals',
      technologies: ['Full Stack Development', 'Cloud Services', 'APIs'],
      spikePotential: true,
      spikeExplanation: 'Specialize in a particular tech stack and participate in multiple hackathons to build a strong portfolio.'
    }
  ],
  'business': [
    {
      name: 'Startup Incubator',
      type: 'club',
      description: 'Join a startup incubator program to learn entrepreneurship',
      technologies: ['Business Model Canvas', 'Market Research', 'Financial Planning'],
      spikePotential: true,
      spikeExplanation: 'Focus on a specific industry vertical and develop deep expertise in that domain.'
    }
  ]
};

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Check rate limit
    const clientData = rateLimitStore.get(clientIp);
    if (clientData) {
      if (now < clientData.resetTime) {
        if (clientData.count >= RATE_LIMIT.max) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
        clientData.count++;
      } else {
        rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
      }
    } else {
      rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    }

    const { interests, currentActivities } = await request.json();

    // Validate input
    if (!interests || !currentActivities) {
      return NextResponse.json(
        { error: 'Interests and current activities are required' },
        { status: 400 }
      );
    }

    // Validate interest levels
    const invalidInterestLevels = interests.filter(
      (i: Interest) => !VALID_INTEREST_LEVELS.includes(i.level)
    );
    if (invalidInterestLevels.length > 0) {
      return NextResponse.json(
        { error: 'Invalid interest level(s) detected', details: invalidInterestLevels },
        { status: 400 }
      );
    }

    // Validate activity types
    const invalidActivityTypes = currentActivities.filter(
      (a: CurrentActivity) => !VALID_ACTIVITY_TYPES.includes(a.type)
    );
    if (invalidActivityTypes.length > 0) {
      return NextResponse.json(
        { error: 'Invalid activity type(s) detected', details: invalidActivityTypes },
        { status: 400 }
      );
    }

    // Prepare the prompt for Gemini
    const prompt = `
      You are an expert career and activity advisor. Your task is to provide personalized, actionable suggestions for students to develop their interests and build expertise.
      
      Based on the following interests and current activities, suggest exactly 3 opportunities for growth and development.
      Focus on suggesting activities that can help develop a "spike" (deep expertise) in their areas of interest.
      
      Interests:
      ${interests.map((i: Interest) => `- ${i.name} (${i.level} level)`).join('\n')}
      
      Current Activities:
      ${currentActivities.map((a: CurrentActivity) => `- ${a.name} (${a.type}): ${a.description}`).join('\n')}
      
      IMPORTANT: You must respond with ONLY a valid JSON object in this exact format, with no additional text or explanation:
      {
        "suggestions": [
          {
            "name": "string",
            "type": "club|leadership|internship|competition",
            "description": "string",
            "technologies": ["string"],
            "spikePotential": true|false,
            "spikeExplanation": "string"
          }
        ]
      }
    `;

    try {
      // Get the Gemini Pro model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });

      // Generate content
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Clean the response to ensure it's valid JSON
      const cleanedContent = content.trim()
        .replace(/^```json\s*/, '')  // Remove ```json if present
        .replace(/```\s*$/, '')      // Remove trailing ```
        .replace(/^```\s*/, '')      // Remove leading ```
        .trim();

      try {
        const parsedResponse = JSON.parse(cleanedContent);
        if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
          throw new Error('Invalid response format from Gemini');
        }

        // Validate each suggestion
        const validSuggestions = parsedResponse.suggestions.map((suggestion: any) => ({
          name: suggestion.name || 'Untitled Opportunity',
          type: suggestion.type || 'club',
          description: suggestion.description || 'No description available',
          technologies: suggestion.technologies || [],
          spikePotential: suggestion.spikePotential || false,
          spikeExplanation: suggestion.spikeExplanation || ''
        }));

        return NextResponse.json({ suggestions: validSuggestions });
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', content);
        throw new Error('Failed to parse Gemini response');
      }
    } catch (geminiError: any) {
      // Handle specific Gemini API errors
      if (geminiError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Google API key' },
          { status: 401 }
        );
      } else if (geminiError.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else if (geminiError.status === 503) {
        return NextResponse.json(
          { error: 'Gemini service is currently unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      throw geminiError;
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
