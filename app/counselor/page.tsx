'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Define message type
type Message = {
  id: string
  content: string
  sender: 'user' | 'counselor'
  timestamp: Date
}

// Define conversation type (simplified for dummy data)
type Conversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Initial welcome messages
const WELCOME_MESSAGES: Message[] = [
  {
    id: uuidv4(), // Use uuid
    content: "Hello! I'm your Polaris college counselor assistant. How can I help with your college journey today?",
    sender: 'counselor' as 'counselor',
    timestamp: new Date()
  },
  {
    id: uuidv4(), // Use uuid
    content: "I can answer questions about applications, essays, financial aid, standardized tests, and more. What would you like to discuss?",
    sender: 'counselor' as 'counselor',
    timestamp: new Date()
  }
]

// Fallback responses in case the API fails
const FALLBACK_RESPONSES = [
  "I apologize, but I'm having trouble connecting to my knowledge base. Please try asking your question again in a moment.",
  "I seem to be experiencing a technical issue. Could you please rephrase your question?",
  "Sorry, I couldn't process that request. Let's try a different approach to your college application questions."
]

// Dummy conversation data
const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: 'dummy1',
    title: 'Previous Chat about Essays',
    messages: [
      ...WELCOME_MESSAGES,
      { id: uuidv4(), content: 'Tell me about writing a good college essay.', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: uuidv4(), content: 'A good essay is authentic and shows your personality. Focus on a specific moment or theme.', sender: 'counselor', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: 'dummy2',
    title: 'Financial Aid Questions',
    messages: [
      WELCOME_MESSAGES[0], // Just the first welcome message for variety
      { id: uuidv4(), content: 'What is the FAFSA?', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { id: uuidv4(), content: 'The FAFSA (Free Application for Federal Student Aid) determines your eligibility for federal grants, loans, and work-study.', sender: 'counselor', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.9) },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 23.9),
  },
];

export default function CounselorChat() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatHistory, setChatHistory] = useState<string>('')
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>(DUMMY_CONVERSATIONS) // Use dummy data
  const [showHistory, setShowHistory] = useState(false)
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    
    // Update chat history for context
    if (messages.length > 2) {
      const historyText = messages
        .slice(-6) // Keep only the last 6 messages for context
        .map(msg => `${msg.sender === 'user' ? 'Student' : 'Counselor'}: ${msg.content}`)
        .join('\n');
      setChatHistory(historyText);
    }
  }, [messages])

  // Generate a response using Gemini
  const generateGeminiResponse = async (userInput: string): Promise<string> => {
    try {
      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      
      // Create the prompt with context
      const prompt = `You are a helpful college counselor assistant named Polaris. You provide expert guidance on college applications, admissions, essays, financial aid, and related topics to high school students.

Previous conversation:
${chatHistory}

Student: ${userInput}

Respond to the student with helpful, accurate, and clear advice. Keep your response concise (2-4 sentences) and directly address their question. If they ask something unrelated to college admissions, kindly redirect them to college-related topics.

Counselor:`;
      
      // Generate the response
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return response.trim();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      // Return a random fallback response
      return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(), // Use uuid
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Show typing indicator
    setIsTyping(true)
    
    try {
      // Generate response with Gemini
      const responseText = await generateGeminiResponse(input.trim());
      
      // Add counselor response
      const counselorMessage: Message = {
        id: uuidv4(), // Use uuid
        content: responseText,
        sender: 'counselor',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, counselorMessage])

    } catch (error) {
      console.error('Error in chat response:', error);
      toast.error('Sorry, I had trouble generating a response. Please try again.');
    } finally {
      setIsTyping(false)
    }
  }
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Format date for conversation history
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">College Counselor</h1>
            <p className="mt-2 text-text-secondary">
              Get expert guidance for your college application journey
            </p>
          </div>
          
          {/* History and New Chat Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className="btn-secondary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
            
            <button
              onClick={() => {
                setCurrentConversation(null);
                setMessages(WELCOME_MESSAGES);
                setShowHistory(false);
              }}
              className="btn-primary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Conversation
            </button>
          </div>
          
          {/* History Section */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="card bg-white rounded-lg shadow overflow-hidden">
                  <h2 className="text-lg font-semibold p-4 border-b">Your Conversation History (Sample)</h2>
                  
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center text-text-secondary">
                      <p>No sample conversations available.</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {conversations.map((convo) => (
                        <div key={convo.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                          <div className="p-4 flex justify-between items-center">
                            <div className="flex-1">
                              <h3 className="font-medium text-text-primary truncate">{convo.title}</h3>
                              <p className="text-xs text-text-secondary">
                                {formatDate(convo.updatedAt || convo.createdAt || new Date())}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentConversation(convo);
                                  setMessages(convo.messages);
                                  setShowHistory(false);
                                }}
                                className="text-primary hover:text-primary-dark"
                                title="Load conversation"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setConversations(prev => prev.filter(c => c.id !== convo.id));
                                  if (currentConversation?.id === convo.id) {
                                    setCurrentConversation(null);
                                    setMessages(WELCOME_MESSAGES);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Delete conversation (simulation)"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Chat container */}
          <div className="card bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[70vh]">
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center bg-primary/5">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium text-text-primary">College Counselor Assistant</p>
                <p className="text-xs text-text-secondary">Powered by Gemini AI</p>
              </div>
              <div className="ml-auto flex space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-text-secondary">Online</span>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-100 text-text-primary rounded-tl-none'
                    }`}>
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 text-right ${
                        message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp))}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>
            
            {/* Input area */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 input-field"
                  placeholder="Type your question..."
                />
                <button 
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-md flex items-center justify-center"
                  disabled={!input.trim() || isTyping}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <div className="mt-2 text-xs text-text-secondary text-center">
                <p>Try asking about: applications, essays, financial aid, test scores, deadlines, interviews</p>
              </div>
            </div>
          </div>
          
          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-medium text-text-primary">AI-Powered Guidance</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Get intelligent answers to all your college application questions, powered by advanced AI technology.
              </p>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-medium text-text-primary">Personalized Advice</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Receive tailored recommendations based on your specific goals and circumstances.
              </p>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-medium text-text-primary">24/7 Availability</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Get college admissions help anytime, with instant responses to your most pressing questions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 