import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: projectId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Check if user is owner or admin of the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: session.user.id,
            role: {
              in: ['OWNER', 'ADMIN']
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or insufficient permissions' }, { status: 404 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: userId
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this project' }, { status: 400 })
    }

    // Add user to project
    const member = await prisma.projectMember.create({
      data: {
        projectId: projectId,
        userId: userId,
        role: role as 'MEMBER' | 'ADMIN'
      },
      include: {
        user: true
      }
    })

    // Create notification for the new member
    await prisma.notification.create({
      data: {
        title: 'Project Invitation',
        message: `You have been added to the project: ${project.name}`,
        type: 'PROJECT_INVITED',
        userId: userId
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error adding project member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: projectId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user is owner or admin of the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: session.user.id,
            role: {
              in: ['OWNER', 'ADMIN']
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or insufficient permissions' }, { status: 404 })
    }

    // Don't allow removing the owner
    if (project.createdById === userId) {
      return NextResponse.json({ error: 'Cannot remove project owner' }, { status: 400 })
    }

    // Remove user from project
    await prisma.projectMember.deleteMany({
      where: {
        projectId: projectId,
        userId: userId
      }
    })

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error removing project member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
