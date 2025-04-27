import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

// Get user's majors
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      primaryMajor: user.profile?.primaryMajor || '',
      backupMajor: user.profile?.backupMajor || ''
    })
  } catch (error) {
    console.error('Error fetching majors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch majors' },
      { status: 500 }
    )
  }
}

// Update user's majors
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { primaryMajor, backupMajor } = body

    await connectDB()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {}
    }

    // Update majors
    user.profile.primaryMajor = primaryMajor || user.profile.primaryMajor
    user.profile.backupMajor = backupMajor || user.profile.backupMajor
    
    await user.save()

    return NextResponse.json({ 
      success: true,
      message: 'Majors updated successfully',
      primaryMajor: user.profile.primaryMajor,
      backupMajor: user.profile.backupMajor
    })
  } catch (error) {
    console.error('Error updating majors:', error)
    return NextResponse.json(
      { error: 'Failed to update majors' },
      { status: 500 }
    )
  }
} 