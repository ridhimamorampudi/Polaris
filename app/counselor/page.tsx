'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

// Define message type
type Message = {
  id: string
  content: string
  sender: 'user' | 'counselor'
  timestamp: Date
}

// Sample counselor responses based on keywords
const COUNSELOR_RESPONSES: Record<string, string[]> = {
  'application': [
    "Start your college application process early, ideally the summer before your senior year.",
    "Most colleges accept the Common Application, which lets you apply to multiple schools at once.",
    "Pay close attention to application deadlines - they vary by school and admission type (early action, early decision, regular)."
  ],
  'essay': [
    "Your personal statement should tell a story unique to you - focus on specific experiences rather than general statements.",
    "College essays should reveal something about you that isn't shown elsewhere in your application.",
    "Always have someone else review your essays for feedback on content, clarity, and grammar."
  ],
  'financial aid': [
    "Complete the FAFSA as soon as it opens on October 1st to maximize your financial aid opportunities.",
    "Look into school-specific scholarships in addition to national scholarship opportunities.",
    "Consider need-blind schools that don't consider your financial situation during admission decisions."
  ],
  'test scores': [
    "Many schools are now test-optional, but strong SAT/ACT scores can still strengthen your application.",
    "Aim to take standardized tests in your junior year to allow time for retakes if needed.",
    "Test prep resources include free options like Khan Academy and College Board practice tests."
  ],
  'recommendation': [
    "Ask teachers who know you well and can speak to your academic abilities and character.",
    "Request recommendations at least 2-3 months before application deadlines.",
    "Provide your recommenders with a resume or summary of your accomplishments to help them write strong letters."
  ],
  'major': [
    "It's okay to be undecided about your major when applying to college.",
    "Consider schools that have strong programs in multiple areas you're interested in.",
    "Research the requirements for majors you're considering to ensure you're prepared."
  ],
  'interview': [
    "Research the college thoroughly before an interview and prepare thoughtful questions.",
    "Practice common interview questions but aim to sound natural, not rehearsed.",
    "Follow up with a thank-you note after your interview."
  ],
  'extracurricular': [
    "Quality matters more than quantity for extracurricular activities.",
    "Colleges value leadership and long-term commitment to activities.",
    "Use your activities to demonstrate your passions and character."
  ],
  'deadline': [
    "Early Decision deadlines typically fall in November, with decisions in December.",
    "Regular Decision deadlines are usually January 1st or 15th, with decisions in March or April.",
    "May 1st is the universal response date for accepting admission offers."
  ],
  'campus visit': [
    "Try to visit when school is in session to get a feel for campus culture.",
    "Schedule an official tour but also explore on your own if possible.",
    "Talk to current students to get their perspective on the school."
  ],
  'transfer': [
    "Requirements for transfer students vary widely between institutions.",
    "Maintain strong grades at your current institution - they're crucial for transfer applications.",
    "Some colleges have articulation agreements with community colleges that guarantee admission for qualified students."
  ]
}

// Default responses when no keywords match
const DEFAULT_RESPONSES = [
  "What specific aspect of the college application process would you like to know more about?",
  "I'm here to help with your college questions. Could you provide more details about what you're looking for?",
  "Whether it's about applications, essays, financial aid, or choosing the right school, I'm happy to assist. What's on your mind?",
  "How can I help with your college preparation journey today?"
]

// Initial welcome messages
const WELCOME_MESSAGES: Message[] = [
  {
    id: '1',
    content: "Hello! I'm your Polaris college counselor assistant. How can I help with your college journey today?",
    sender: 'counselor' as 'counselor',
    timestamp: new Date()
  },
  {
    id: '2',
    content: "I can answer questions about applications, essays, financial aid, standardized tests, and more. What would you like to discuss?",
    sender: 'counselor' as 'counselor',
    timestamp: new Date()
  }
]

export default function CounselorChat() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate a response based on user input
  const generateResponse = (userInput: string): string => {
    const lowercaseInput = userInput.toLowerCase()
    
    // Check for keyword matches
    const matchedResponses: string[] = []
    Object.entries(COUNSELOR_RESPONSES).forEach(([keyword, responses]) => {
      if (lowercaseInput.includes(keyword)) {
        matchedResponses.push(responses[Math.floor(Math.random() * responses.length)])
      }
    })
    
    // Return a matched response or default if no matches
    if (matchedResponses.length > 0) {
      return matchedResponses[Math.floor(Math.random() * matchedResponses.length)]
    } else {
      return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)]
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Simulate counselor typing
    setIsTyping(true)
    
    // Add counselor response after a delay
    setTimeout(() => {
      const counselorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(input),
        sender: 'counselor',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, counselorMessage])
      setIsTyping(false)
    }, 1500) // 1.5 second delay to simulate typing
  }
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                <p className="text-xs text-text-secondary">Always available to help</p>
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
                        {formatTime(message.timestamp)}
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
                  disabled={!input.trim()}
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
                <h3 className="font-medium text-text-primary">Expert Guidance</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Get reliable answers to all your college application questions, available 24/7.
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
                <h3 className="font-medium text-text-primary">Stress Reduction</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Minimize application anxiety with clear guidance through each step of the process.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 