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
        createdBy: true,
        project: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        },
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        discussions: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: projectId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, status, priority, dueDate, assignedToId } = await request.json()

    // Check if user has access to the task
    const existingTask = await prisma.task.findFirst({
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
        project: true
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // If assignedToId is provided, verify the user is a member of the project
    if (assignedToId) {
      const assignedUser = await prisma.projectMember.findFirst({
        where: {
          projectId: existingTask.projectId,
          userId: assignedToId
        }
      })

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user is not a member of this project' },
          { status: 400 }
        )
      }
    }

    const task = await prisma.task.update({
      where: { id: projectId },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId
      },
      include: {
        assignedTo: true,
        createdBy: true,
        project: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        },
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        discussions: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // Create notification for assigned user if changed
    if (assignedToId && assignedToId !== existingTask.assignedToId && assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: 'Task Assigned',
          message: `You have been assigned a task: ${task.title}`,
          type: 'TASK_ASSIGNED',
          userId: assignedToId
        }
      })
    }

    // Create notification for task updates
    if (assignedToId && assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: 'Task Updated',
          message: `Task "${task.title}" has been updated`,
          type: 'TASK_UPDATED',
          userId: assignedToId
        }
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
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

    // Check if user is owner or admin of the project
    const task = await prisma.task.findFirst({
      where: {
        id: projectId,
        project: {
          members: {
            some: {
              userId: session.user.id,
              role: {
                in: ['OWNER', 'ADMIN']
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found or insufficient permissions' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: projectId }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
