'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is on auth page or home page
    const isPublicPage = window.location.pathname === '/' || window.location.pathname === '/auth'
    setIsAuthenticated(!isPublicPage)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null // or a loading spinner
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">Polaris</Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-text-secondary hover:text-text-primary">Dashboard</Link>
                <Link href="/profile" className="text-text-secondary hover:text-text-primary">Profile</Link>
                <Link href="/colleges" className="text-text-secondary hover:text-text-primary">Colleges</Link>
                <Link href="/major" className="text-text-secondary hover:text-text-primary">Major</Link>
                <Link href="/activities" className="text-text-secondary hover:text-text-primary">Activities</Link>
                <Link href="/essay" className="text-text-secondary hover:text-text-primary">Essay</Link>
                <button 
                  onClick={() => {
                    // Handle logout
                    window.location.href = '/'
                  }}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 