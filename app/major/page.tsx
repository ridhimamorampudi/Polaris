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