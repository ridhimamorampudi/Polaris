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
      <div className="relative bg-white py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl sm:text-5xl font-bold text-text-primary mb-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Everything you need to succeed
          </motion.h2>
          
          <div className="space-y-12">
            {[
              {
                title: "Profile Building",
                description: "Create a comprehensive academic profile highlighting your strengths.",
                icon: (
                  <svg className="w-12 h-12 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              {
                title: "College Matching",
                description: "Get personalized college recommendations based on your profile.",
                icon: (
                  <svg className="w-12 h-12 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              {
                title: "Mock Interviews",
                description: "Practice with AI-powered mock interviews and receive detailed feedback to improve your performance.",
                icon: (
                  <svg className="w-12 h-12 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                )
              },
              {
                title: "Essay Review",
                description: "Receive detailed feedback on your college essays from AI.",
                icon: (
                  <svg className="w-12 h-12 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="card p-8 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.03 }}
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 