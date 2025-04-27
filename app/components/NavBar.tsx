'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NavBar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error signing out')
      console.error('Sign out error:', error)
    }
  }

  if (status === 'loading') {
    return null // or a loading spinner
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={session ? "/dashboard" : "/"} className="text-2xl font-bold text-primary">Polaris</Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {session ? (
              <>
                <Link href="/dashboard" className="text-text-secondary hover:text-text-primary">Dashboard</Link>
                <Link href="/profile" className="text-text-secondary hover:text-text-primary">Profile</Link>
                <Link href="/major" className="text-text-secondary hover:text-text-primary">Major</Link>
                <Link href="/activities" className="text-text-secondary hover:text-text-primary">Activities</Link>
                <Link href="/interviews" className="text-text-secondary hover:text-text-primary">Interviews</Link>
                <Link href="/essay" className="text-text-secondary hover:text-text-primary">Essay</Link>
                <Link href="/counselor" className="text-text-secondary hover:text-text-primary">Counselor</Link>
                <Link href="/resume" className="text-text-secondary hover:text-text-primary">Resume</Link>
                <button 
                  onClick={handleSignOut}
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