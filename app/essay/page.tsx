'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

type FeedbackType = {
  category: 'grammar' | 'tone' | 'structure'
  items: {
    text: string
    severity: 'low' | 'medium' | 'high'
  }[]
}

export default function EssayReview() {
  const [essay, setEssay] = React.useState('')
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [feedback, setFeedback] = React.useState<FeedbackType[]>([])

  const handleEssaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!essay.trim()) {
      toast.error('Please enter your essay')
      return
    }

    setIsAnalyzing(true)
    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulated feedback
    setFeedback([
      {
        category: 'grammar',
        items: [
          { text: 'Consider revising passive voice constructions', severity: 'medium' },
          { text: 'Check comma usage in compound sentences', severity: 'low' },
        ]
      },
      {
        category: 'tone',
        items: [
          { text: 'The essay maintains a consistent formal tone', severity: 'low' },
          { text: 'Consider adding more personal voice in key sections', severity: 'medium' },
        ]
      },
      {
        category: 'structure',
        items: [
          { text: 'Strong introduction that hooks the reader', severity: 'low' },
          { text: 'Consider strengthening the conclusion', severity: 'high' },
          { text: 'Good use of transition phrases between paragraphs', severity: 'low' },
        ]
      }
    ])
    setIsAnalyzing(false)
    toast.success('Essay analysis complete!')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'high':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">Essay Review</h1>
            <p className="mt-2 text-text-secondary">
              Get detailed feedback on your college essay
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleEssaySubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="essay"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Paste your essay here
                </label>
                <textarea
                  id="essay"
                  rows={12}
                  className="input-field font-mono text-sm"
                  placeholder="Enter your essay text..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className={`btn-primary ${isAnalyzing ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing...
                    </div>
                  ) : (
                    'Review Essay'
                  )}
                </button>
              </div>
            </form>
          </div>

          {feedback.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {feedback.map((section, index) => (
                <div key={index} className="card">
                  <h2 className="text-xl font-semibold text-text-primary capitalize mb-4">
                    {section.category} Feedback
                  </h2>
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`p-3 rounded-lg ${getSeverityColor(item.severity)}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {item.severity === 'high' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            ) : item.severity === 'medium' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <span className="ml-2">{item.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setEssay('')
                    setFeedback([])
                    toast.success('Ready for a new essay!')
                  }}
                  className="btn-primary"
                >
                  Review Another Essay
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 