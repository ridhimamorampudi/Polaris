'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiMic, FiPlus } from 'react-icons/fi'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
            <p className="mt-2 text-xl text-text-secondary">
              Welcome to College Compass! Here's a summary of your progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Profile</h2>
                <p className="text-text-secondary">
                  Your academic and extracurricular information.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">GPA:</span>
                    <span className="font-medium text-text-primary">N/A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">SAT:</span>
                    <span className="font-medium text-text-primary">N/A</span>
                  </div>
                </div>
                <Link 
                  href="/profile"
                  className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  <span>View Profile</span>
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* College List Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">College List</h2>
                <p className="text-text-secondary">
                  Your saved list of potential colleges.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Reach:</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Match:</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Safety:</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">0</span>
                  </div>
                </div>
                <Link 
                  href="/colleges"
                  className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  <span>Manage Colleges</span>
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Interview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <FiMic className="w-6 h-6 text-text-secondary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Interviews</h2>
                <p className="text-text-secondary">
                  Practice your interview skills with AI-generated questions.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Active Interviews:</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Completed:</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">0</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link 
                    href="/interviews"
                    className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                  >
                    <span>View Interviews</span>
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link 
                    href="/interviews/new"
                    className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                  >
                    <FiPlus className="w-5 h-5 mr-1" />
                    <span>New Interview</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Majors Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text-primary">Majors</h2>
              <p className="text-text-secondary">
                Explore and select your intended majors.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Primary:</span>
                  <span className="font-medium text-text-primary">N/A</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Backup:</span>
                  <span className="font-medium text-text-primary">N/A</span>
                </div>
              </div>
              <Link 
                href="/major"
                className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
              >
                <span>Explore Majors</span>
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/activities"
                className="card p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Plan Activities</h3>
                  <p className="text-sm text-text-secondary">Discover and add extracurricular activities</p>
                </div>
              </Link>

              <Link 
                href="/essay"
                className="card p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Review Essays</h3>
                  <p className="text-sm text-text-secondary">Get feedback on your college essays</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 