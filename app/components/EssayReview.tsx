'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiCheck, FiLoader, FiInfo, FiAlertCircle, FiThumbsUp } from 'react-icons/fi';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface LineComment {
  lineNumber: number;
  text: string;
  type: 'suggestion' | 'improvement' | 'strength';
  category: 'structure' | 'tone' | 'grammar' | 'content' | 'style' | 'clarity';
}

interface EssayFeedback {
  overallScore: number;
  structure: string;
  tone: string;
  grammar: string;
  emotionalEngagement: string;
  strengths: string[];
  weaknesses: string[];
  lineComments: LineComment[];
  summary: string;
  actionableNextSteps: string[];
}

const EssayReview: React.FC = () => {
  const [essayPrompt, setEssayPrompt] = useState('');
  const [wordCount, setWordCount] = useState('');
  const [essayText, setEssayText] = useState('');
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'lineComments' | 'nextSteps'>('analysis');

  const handleSubmit = async () => {
    if (!essayText.trim() || !essayPrompt.trim()) {
      setError('Please provide both the essay prompt and your essay text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/essay-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: essayPrompt,
          essay: essayText,
          wordCount: parseInt(wordCount) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }

      const data = await response.json();
      
      // For demonstration, if the API doesn't return line comments yet,
      // we'll simulate some sample line-by-line feedback
      if (!data.feedback.lineComments) {
        const essayLines = essayText.split('\n');
        const sampleLineComments: LineComment[] = [];
        
        // Add some sample comments for demonstration
        if (essayLines.length > 1) {
          sampleLineComments.push({
            lineNumber: 1,
            text: "Strong opening that captures attention. Consider adding more specific detail to make it even more compelling.",
            type: 'suggestion',
            category: 'structure'
          });
        }
        
        if (essayLines.length > 3) {
          sampleLineComments.push({
            lineNumber: 3,
            text: "This sentence could be more concise. Try removing unnecessary adverbs.",
            type: 'improvement',
            category: 'style'
          });
        }
        
        if (essayLines.length > 5) {
          sampleLineComments.push({
            lineNumber: 5,
            text: "Excellent use of vivid imagery here that strengthens your narrative.",
            type: 'strength',
            category: 'content'
          });
        }
        
        if (essayLines.length > 7) {
          sampleLineComments.push({
            lineNumber: 7,
            text: "Consider revising this transition. It feels abrupt and could benefit from a more gradual shift.",
            type: 'improvement',
            category: 'structure'
          });
        }
        
        if (essayLines.length > 9) {
          sampleLineComments.push({
            lineNumber: 9,
            text: "Grammar issue: subject-verb agreement problem in this sentence.",
            type: 'improvement',
            category: 'grammar'
          });
        }
        
        data.feedback = {
          ...data.feedback,
          lineComments: sampleLineComments,
          overallScore: 85,
          summary: "Your essay demonstrates thoughtful reflection and clear writing skills. The personal narrative is compelling, though some structural improvements could strengthen the overall impact. Your voice comes through authentically, which is crucial for college essays.",
          actionableNextSteps: [
            "Revise the introduction to more directly address the prompt",
            "Add more specific examples to support your main arguments",
            "Work on smoother transitions between paragraphs",
            "Proofread for grammar and punctuation consistency",
            "Consider adding a more reflective conclusion that ties back to your opening"
          ]
        };
      }
      
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'structure': return 'bg-blue-100 text-blue-800';
      case 'tone': return 'bg-purple-100 text-purple-800';
      case 'grammar': return 'bg-red-100 text-red-800';
      case 'content': return 'bg-green-100 text-green-800';
      case 'style': return 'bg-yellow-100 text-yellow-800';
      case 'clarity': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <FiInfo className="text-blue-500" />;
      case 'improvement': return <FiAlertCircle className="text-amber-500" />;
      case 'strength': return <FiThumbsUp className="text-green-500" />;
      default: return <FiInfo />;
    }
  };

  const renderEssayWithHighlights = () => {
    if (!essayText) return null;
    
    const lines = essayText.split('\n');
    const commentsByLine = feedback?.lineComments.reduce((acc, comment) => {
      acc[comment.lineNumber] = [...(acc[comment.lineNumber] || []), comment];
      return acc;
    }, {} as Record<number, LineComment[]>) || {};
    
    return (
      <div className="font-serif text-lg space-y-1">
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={`relative py-1 pl-2 rounded ${
              selectedLine === index + 1 ? 'bg-blue-50' : 
              commentsByLine[index + 1] ? 'hover:bg-gray-50 cursor-pointer' : ''
            } ${commentsByLine[index + 1] ? 'border-l-4 border-blue-400' : ''}`}
            onClick={() => commentsByLine[index + 1] && setSelectedLine(index + 1)}
          >
            <div className="flex">
              <span className="text-gray-400 text-sm w-7 flex-shrink-0 pt-1">{index + 1}</span>
              <span className={`flex-grow ${line.trim() === '' ? 'h-6' : ''}`}>
                {line || ' '}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Essay Review</h1>
          <p className="mt-2 text-xl text-gray-600">Get professional, line-by-line feedback on your college essay</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm animate-fadeIn border-l-4 border-red-500">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Essay Details Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Essay Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Prompt
                </label>
                <textarea
                  value={essayPrompt}
                  onChange={(e) => setEssayPrompt(e.target.value)}
                  placeholder="Enter the essay prompt"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Count Limit
                </label>
                <input
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  placeholder="Enter word count"
                  className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
                />
              </div>
            </div>
          </div>

          {!feedback ? (
            /* Essay Text Section */
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Essay</h2>
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste your essay here"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] text-lg font-serif"
              />
              <div className="mt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-sm flex items-center gap-2 text-lg ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
                  {loading ? 'Analyzing...' : 'Get Feedback'}
                </Button>
              </div>
            </div>
          ) : (
            /* Essay and Feedback Split View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Essay with highlights */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Your Essay</h2>
                  <div className="text-sm text-gray-500">
                    {essayText.split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                </div>
                <ScrollArea className="h-[600px] pr-4">
                  {renderEssayWithHighlights()}
                </ScrollArea>
              </div>

              {/* Feedback panel */}
              <div className="flex flex-col">
                {/* Overall score card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Overall Score</h2>
                    <div className="text-4xl font-bold text-blue-600">{feedback.overallScore}/100</div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${feedback.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-gray-700">
                    {feedback.summary}
                  </p>
                </div>
                
                {/* Line-specific feedback when a line is selected */}
                {selectedLine && feedback.lineComments.filter(c => c.lineNumber === selectedLine).length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900">
                        Line {selectedLine} Feedback
                      </h3>
                      <Button 
                        onClick={() => setSelectedLine(null)}
                        variant="ghost"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Close
                      </Button>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      {feedback.lineComments
                        .filter(comment => comment.lineNumber === selectedLine)
                        .map((comment, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="mt-1">
                              {getCommentTypeIcon(comment.type)}
                            </div>
                            <div className="flex-1">
                              <div className="mb-1">
                                <Badge className={getCategoryColor(comment.category)}>
                                  {comment.category.charAt(0).toUpperCase() + comment.category.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-gray-700">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
                
                {/* Tabbed feedback */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-grow">
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px overflow-x-auto">
                      <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`border-b-2 py-4 px-6 text-sm font-medium ${
                          activeTab === 'analysis' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Detailed Analysis
                      </button>
                      <button 
                        onClick={() => setActiveTab('lineComments')}
                        className={`border-b-2 py-4 px-6 text-sm font-medium ${
                          activeTab === 'lineComments' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Line Comments
                      </button>
                      <button 
                        onClick={() => setActiveTab('nextSteps')}
                        className={`border-b-2 py-4 px-6 text-sm font-medium ${
                          activeTab === 'nextSteps' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Next Steps
                      </button>
                    </nav>
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    {activeTab === 'analysis' && (
                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Structure
                          </h3>
                          <p className="text-gray-700">{feedback.structure}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            Tone
                          </h3>
                          <p className="text-gray-700">{feedback.tone}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            Grammar
                          </h3>
                          <p className="text-gray-700">{feedback.grammar}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                            Emotional Engagement
                          </h3>
                          <p className="text-gray-700">{feedback.emotionalEngagement}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h3>
                          <ul className="list-disc list-inside text-gray-700 space-y-2">
                            {feedback.strengths.map((strength, index) => (
                              <li key={index} className="pl-2">
                                <span className="text-green-600 font-medium">+</span> {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
                          <ul className="list-disc list-inside text-gray-700 space-y-2">
                            {feedback.weaknesses.map((weakness, index) => (
                              <li key={index} className="pl-2">
                                <span className="text-amber-600 font-medium">△</span> {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'lineComments' && (
                      <div className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Line Comments</h3>
                        {feedback.lineComments.length > 0 ? (
                          <div className="space-y-4">
                            {feedback.lineComments.map((comment, idx) => (
                              <div key={idx} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="mt-1">
                                  {getCommentTypeIcon(comment.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <div className="text-sm font-medium text-gray-700 mr-2">
                                      Line {comment.lineNumber}:
                                    </div>
                                    <Badge className={getCategoryColor(comment.category)}>
                                      {comment.category.charAt(0).toUpperCase() + comment.category.slice(1)}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-700">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            No line-specific comments available.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'nextSteps' && (
                      <div className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Plan</h3>
                        <p className="text-gray-700 mb-6">
                          Based on our analysis, here are specific steps to improve your essay:
                        </p>
                        
                        <ol className="space-y-5">
                          {feedback.actionableNextSteps?.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-semibold justify-center items-center mr-3 mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-gray-700">{step}</p>
                            </li>
                          ))}
                        </ol>
                        
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
                          <p className="text-gray-700 text-sm">
                            After implementing these changes, consider asking a trusted teacher or mentor to review your essay.
                            Fresh eyes can often catch things you might miss and provide valuable perspective.
                          </p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                {/* Return button */}
                <div className="mt-6">
                  <Button 
                    onClick={() => setFeedback(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg shadow-sm"
                  >
                    Revise Essay
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EssayReview; 