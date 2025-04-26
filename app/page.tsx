'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-6xl font-bold text-text-primary mb-6 font-display">
            Plan your dream college journey with AI.
          </h1>
          <p className="text-xl sm:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto">
            Build your profile, plan your activities, get essay feedback — all in one place.
          </p>
          
          <div className="relative w-full max-w-4xl mx-auto mb-16">
            <Image
              src="/college-illustration.svg"
              alt="College Journey Illustration"
              width={800}
              height={400}
              className="w-full h-auto"
            />
          </div>

          <Link 
            href="/auth"
            className="btn-primary text-lg sm:text-xl inline-flex items-center space-x-2"
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

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Profile Building</h3>
              <p className="text-text-secondary">Create a comprehensive academic profile highlighting your strengths.</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">College Matching</h3>
              <p className="text-text-secondary">Get personalized college recommendations based on your profile.</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Essay Review</h3>
              <p className="text-text-secondary">Receive detailed feedback on your college essays from AI.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 