'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiAlertCircle, FiMessageCircle, FiThumbsUp, FiArrowLeft } from 'react-icons/fi';

interface Feedback {
  _id: string;
  interviewId: string;
  userId: string;
  transcript: Array<{
    role: string;
    content: string;
  }>;
  createdAt: string;
}

interface Interview {
  _id: string;
  topic: string;
  role: string;
  questions: string[];
}

interface FeedbackAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  questionSpecificFeedback: Record<string, {
    score: number;
    feedback: string;
  }>;
  communicationStyle: string;
  technicalAccuracy: string;
  confidence: string;
  nextSteps: string[];
}

export default function InterviewFeedbackPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'transcript'>('summary');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch interview details
        const interviewRes = await fetch(`/api/interviews/${params.id}`);
        const interviewData = await interviewRes.json();
        setInterview(interviewData.interview);

        // Fetch the most recent feedback for this interview
        const feedbackRes = await fetch(`/api/feedback?interviewId=${params.id}&userId=${session?.user?.id}`);
        const feedbackData = await feedbackRes.json();
        
        if (feedbackData.feedback) {
          setFeedback(feedbackData.feedback);
          
          // For this demo, we'll generate analysis based on the transcript
          // In a real application, you would have a more sophisticated analysis
          generateAnalysis(feedbackData.feedback.transcript, interviewData.interview.questions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [params.id, session?.user?.id]);

  const generateAnalysis = (transcript: any[], questions: string[]) => {
    // This is a simplified example - in a real app, you'd use AI to generate this analysis
    const userResponses = transcript.filter(msg => msg.role === 'user').map(msg => msg.content);
    
    // Simulated analysis
    const mockAnalysis: FeedbackAnalysis = {
      overallScore: Math.floor(70 + Math.random() * 25), // Random score between 70-95
      strengths: [
        'Good communication skills and clarity in responses',
        'Demonstrated technical knowledge in key areas',
        'Structured answers with clear examples'
      ],
      improvements: [
        'Could provide more specific technical details in some answers',
        'Consider using the STAR method more consistently for behavioral questions',
        'Be more concise in some responses while maintaining depth'
      ],
      questionSpecificFeedback: {},
      communicationStyle: 'Your communication style is clear and professional. You articulate ideas well and maintain good pacing throughout the interview.',
      technicalAccuracy: 'Your technical knowledge is solid, with room for deeper exploration in some areas. Consider preparing more specific examples of technical implementations.',
      confidence: 'You present with confidence but could be more assertive when discussing your strengths and achievements.',
      nextSteps: [
        'Review key technical concepts related to this role',
        'Practice the STAR method for behavioral questions',
        'Prepare more specific examples of past projects',
        'Consider mock interviews with industry professionals'
      ]
    };
    
    // Generate feedback for each question
    questions.forEach((question, index) => {
      const response = userResponses[index] || '';
      const wordCount = response.split(' ').length;
      
      let score = 60 + Math.floor(Math.random() * 30); // Random score between 60-90
      
      // Adjust score based on response length (simplistic approach)
      if (wordCount < 20) score = Math.max(50, score - 15);
      if (wordCount > 100) score = Math.min(95, score + 10);
      
      mockAnalysis.questionSpecificFeedback[question] = {
        score,
        feedback: getRandomFeedback(score)
      };
    });
    
    setAnalysis(mockAnalysis);
  };
  
  const getRandomFeedback = (score: number) => {
    if (score >= 85) {
      return 'Excellent response with clear structure and relevant examples. Good depth of knowledge demonstrated.';
    } else if (score >= 70) {
      return 'Good response with some relevant examples. Could be improved with more specific technical details.';
    } else {
      return 'Basic response that addresses the question but lacks depth. Consider using the STAR method and providing more concrete examples.';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!interview || !feedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">No feedback available</h1>
        <p className="text-gray-600 mb-6">You haven't completed this interview yet or no feedback was generated.</p>
        <button 
          onClick={() => router.push(`/interviews/${params.id}`)}
          className="btn-primary"
        >
          Take Interview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => router.push('/interviews')}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Interviews
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-2">{interview.topic} Interview</h2>
              <p className="text-gray-600 mb-4">Role: {interview.role}</p>
              
              {analysis && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Overall Score</span>
                    <span className={`font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${analysis.overallScore >= 85 ? 'bg-green-500' : analysis.overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${analysis.overallScore}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'summary' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'questions' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Questions
                </button>
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'transcript' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Transcript
                </button>
              </div>
              
              {activeTab === 'questions' && (
                <div className="space-y-2">
                  {interview.questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveQuestion(index)}
                      className={`w-full text-left p-3 rounded-md text-sm ${
                        activeQuestion === index 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="mr-2">Q{index + 1}:</span>
                        <span className="line-clamp-2">{question}</span>
                      </div>
                      {analysis?.questionSpecificFeedback[question] && (
                        <div className={`text-xs mt-1 font-medium ${
                          activeQuestion === index 
                            ? 'text-white' 
                            : getScoreColor(analysis.questionSpecificFeedback[question].score)
                        }`}>
                          Score: {analysis.questionSpecificFeedback[question].score}/100
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'summary' && analysis && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Interview Performance Summary</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                        <FiBarChart2 className="mr-2" />
                        Overall Performance
                      </h3>
                      <div className="text-gray-700">
                        <div className="flex justify-between mb-1">
                          <span>Overall Score:</span>
                          <span className={`font-bold ${getScoreColor(analysis.overallScore)}`}>
                            {analysis.overallScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                          <div 
                            className={`h-2.5 rounded-full ${analysis.overallScore >= 85 ? 'bg-green-500' : analysis.overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${analysis.overallScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center">
                        <FiMessageCircle className="mr-2" />
                        Communication Style
                      </h3>
                      <p className="text-gray-700">
                        {analysis.communicationStyle}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center text-green-700">
                        <FiThumbsUp className="mr-2" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center text-amber-700">
                        <FiAlertCircle className="mr-2" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <FiAlertCircle className="text-amber-500 mt-1 mr-2 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recommended Next Steps</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      {analysis.nextSteps.map((step, index) => (
                        <li key={index} className="pl-1">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              
              {activeTab === 'questions' && analysis && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Question Analysis</h2>
                  
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold mb-2">Question {activeQuestion + 1}</h3>
                      <p className="text-gray-800">{interview.questions[activeQuestion]}</p>
                    </div>
                    
                    {feedback.transcript && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="text-md font-medium text-blue-700 mb-2">Your Response</h4>
                        <p className="text-gray-700">
                          {feedback.transcript
                            .filter(msg => msg.role === 'user')
                            [activeQuestion]?.content || 'No response recorded for this question.'}
                        </p>
                      </div>
                    )}
                    
                    {analysis.questionSpecificFeedback[interview.questions[activeQuestion]] && (
                      <div className="border rounded-lg overflow-hidden mb-4">
                        <div className="flex items-center p-3 border-b">
                          <div className="font-medium">Performance Score</div>
                          <div className={`ml-auto font-bold ${getScoreColor(analysis.questionSpecificFeedback[interview.questions[activeQuestion]].score)}`}>
                            {analysis.questionSpecificFeedback[interview.questions[activeQuestion]].score}/100
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium mb-2">Feedback</h4>
                          <p className="text-gray-700">
                            {analysis.questionSpecificFeedback[interview.questions[activeQuestion]].feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'transcript' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Interview Transcript</h2>
                  
                  <div className="space-y-4">
                    {feedback.transcript?.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.role === 'user' 
                            ? 'bg-blue-50 ml-auto' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {message.role === 'user' ? 'You' : 'AI Interviewer'}
                        </div>
                        <div className="text-gray-700">
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 