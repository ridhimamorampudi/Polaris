
import connectDB from "@/lib/mongodb";
import Interview from "@/models/Interview"; // <-- import your model
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
    const { topic, type, role, level, knowledge, amount, userid } = await request.json();
  
    try {
      const { text: rawQuestions } = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: `Prepare questions for a ${topic} interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The knowledge being tested is: ${knowledge}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
          Thank you! <3`,
      });
  
      console.log('Raw response from Gemini:', rawQuestions);  // <- DEBUG
  
      let questionsArray: string[] = [];
  
      // Try parsing
      try {
        questionsArray = JSON.parse(rawQuestions);
        if (!Array.isArray(questionsArray)) {
          throw new Error('Parsed output is not an array.');
        }
      } catch (e) {
        console.error('Failed to parse Gemini response:', rawQuestions);
        throw new Error('Failed to parse generated questions. Gemini might have returned invalid format.');
      }
  
      await connectDB(); // connect to MongoDB
  
      const interview = await Interview.create({
        topic,
        role,
        type,
        level,
        techstack: knowledge.split(','),
        questions: questionsArray,
        userId: userid,
        finalized: true,
        createdAt: new Date().toISOString()
      });
  
      return Response.json({
        success: true,
        interview,
      }, { status: 200 });
  
    } catch (error: any) {
      console.error('Error caught:', error?.message || error);
      return Response.json({
        success: false,
        error: error?.message || "Unknown error"
      }, { status: 500 });  
    }
  }  