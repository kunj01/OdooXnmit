import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: projectId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is member of project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const discussions = await prisma.projectDiscussion.findMany({
      where: {
        projectId: projectId
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(discussions)
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if user is member of project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const discussion = await prisma.projectDiscussion.create({
      data: {
        title,
        content,
        projectId: projectId,
        userId: session.user.id
      },
      include: {
        user: true
      }
    })

    // Create notifications for other project members
    const otherMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId,
        userId: {
          not: session.user.id
        }
      }
    })

    if (otherMembers.length > 0) {
      await prisma.notification.createMany({
        data: otherMembers.map((member: any) => ({
          title: 'New Discussion',
          message: `New discussion started: ${title}`,
          type: 'DISCUSSION_ADDED',
          userId: member.userId
        }))
      })
    }

    return NextResponse.json(discussion, { status: 201 })
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
