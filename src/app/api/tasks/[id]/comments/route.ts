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

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: projectId,
        project: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        taskId: projectId
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
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

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: projectId,
        project: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        assignedTo: true,
        project: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: projectId,
        userId: session.user.id
      },
      include: {
        user: true
      }
    })

    // Create notifications for task assignee and other project members (except commenter)
    const notifications = []
    
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      notifications.push({
        title: 'New Comment',
        message: `New comment on task: ${task.title}`,
        type: 'COMMENT_ADDED' as const,
        userId: task.assignedToId
      })
    }

    // Notify other project members
    for (const member of task.project.members) {
      if (member.userId !== session.user.id && member.userId !== task.assignedToId) {
        notifications.push({
          title: 'New Comment',
          message: `New comment on task: ${task.title}`,
          type: 'COMMENT_ADDED' as const,
          userId: member.userId
        })
      }
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
