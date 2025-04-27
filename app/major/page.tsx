'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

const popularMajors = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Biology',
  'Psychology',
  'Economics',
  'English',
  'Political Science',
  'Mathematics',
  'Chemistry',
]

export default function MajorSelection() {
  const [primaryMajor, setPrimaryMajor] = React.useState('')
  const [backupMajor, setBackupMajor] = React.useState('')
  const [searchPrimary, setSearchPrimary] = React.useState('')
  const [searchBackup, setSearchBackup] = React.useState('')

  const filteredPrimaryMajors = popularMajors.filter(major =>
    major.toLowerCase().includes(searchPrimary.toLowerCase())
  )

  const filteredBackupMajors = popularMajors.filter(major =>
    major.toLowerCase().includes(searchBackup.toLowerCase())
  )

  const handleSave = () => {
    if (!primaryMajor) {
      toast.error('Please select a primary major')
      return
    }
    toast.success('Majors saved successfully!')
    window.location.href = '/activities'
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">Choose Your Majors</h1>
            <p className="mt-2 text-text-secondary">
              Select your primary major and an optional backup major
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Primary Major Selection */}
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">Primary Major</h2>
              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search majors..."
                  value={searchPrimary}
                  onChange={(e) => setSearchPrimary(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {filteredPrimaryMajors.map(major => (
                  <button
                    key={major}
                    onClick={() => setPrimaryMajor(major)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      primaryMajor === major
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {major}
                  </button>
                ))}
              </div>
              {primaryMajor && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-text-secondary">Selected:</div>
                  <div className="tag mt-1">{primaryMajor}</div>
                </div>
              )}
            </div>

            {/* Backup Major Selection */}
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Backup Major
                <span className="text-sm font-normal text-text-secondary ml-2">
                  (Optional)
                </span>
              </h2>
              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search majors..."
                  value={searchBackup}
                  onChange={(e) => setSearchBackup(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {filteredBackupMajors.map(major => (
                  <button
                    key={major}
                    onClick={() => setBackupMajor(major)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      backupMajor === major
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {major}
                  </button>
                ))}
              </div>
              {backupMajor && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-text-secondary">Selected:</div>
                  <div className="tag mt-1">{backupMajor}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-accent bg-opacity-10 rounded-lg p-4 text-accent">
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                Choosing a backup major increases your flexibility and opportunities during the college application process.
              </p>
            </div>
          </div>

          {/* AI Quiz Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/major/quiz" className="card hover:shadow-lg transition-shadow">
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">AI Major Quiz</h3>
                <p className="text-sm text-text-secondary">
                  Take our AI-powered quiz to discover majors that match your personality and interests
                </p>
              </div>
            </Link>

            <Link href="/colleges/quiz" className="card hover:shadow-lg transition-shadow">
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">AI College Quiz</h3>
                <p className="text-sm text-text-secondary">
                  Not sure which colleges to apply to? Let our AI help you find the perfect match
                </p>
              </div>
            </Link>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              Save and Continue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 