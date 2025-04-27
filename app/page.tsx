'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Set isClient to true once component mounts (client-side only)
    setIsClient(true);
    
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Generate the animated background elements only on the client side
  const renderAnimatedElements = () => {
    if (!isClient) return null;
    
    return [...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary opacity-10"
        initial={{ 
          width: Math.random() * 300 + 100, 
          height: Math.random() * 300 + 100,
          x: Math.random() * windowSize.width, 
          y: Math.random() * windowSize.height,
          scale: 0.8
        }}
        animate={{ 
          x: Math.random() * windowSize.width, 
          y: Math.random() * windowSize.height,
          scale: [0.8, 1.2, 0.8],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: Math.random() * 20 + 15,
          ease: "easeInOut"
        }}
      />
    ));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Hero Section with Fixed Height */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Interactive gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"
          style={{
            backgroundPosition: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
            transition: 'background-position 0.2s ease-out'
          }}
        />
        
        {/* Animated background elements - only rendered client-side */}
        <div className="absolute inset-0 overflow-hidden">
          {isClient && renderAnimatedElements()}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1 
            className="text-5xl sm:text-7xl font-bold text-text-primary mb-6 font-display tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Plan your dream college journey
            </span>
            <br />with AI.
          </motion.h1>
          
          <motion.p 
            className="text-xl sm:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Build your profile, plan your activities, get essay feedback — all in one place.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link 
              href="/auth"
              className="btn-primary text-lg sm:text-xl inline-flex items-center space-x-2 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:scale-105"
            >
              <span>Get Started</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          >
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative bg-gradient-to-b from-indigo-50 to-purple-50 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you navigate every step of your college journey.
            </p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                title: "Profile Building",
                description: "Create a comprehensive academic profile highlighting your strengths and achievements that stand out to admissions officers.",
                icon: (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )
              },
              {
                title: "College Matching",
                description: "Get personalized college recommendations based on your academic profile, preferences, and career aspirations.",
                icon: (
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )
              },
              {
                title: "Mock Interviews",
                description: "Practice with AI-powered mock interviews and receive detailed feedback to improve your performance and build confidence.",
                icon: (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  </div>
                )
              },
              {
                title: "Essay Review",
                description: "Receive detailed feedback on your college essays from AI to improve clarity, structure, and impact for admissions committees.",
                icon: (
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                )
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="card p-8 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col md:flex-row items-start"
              >
                <div className="mr-6 mb-4 md:mb-0 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out shadow-sm"
            >
              <span>Start Your Journey</span>
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 