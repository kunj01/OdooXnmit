import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: hashedPassword,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'mike.wilson@example.com' },
    update: {},
    create: {
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Users created')

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      createdById: user1.id,
      members: {
        create: [
          {
            userId: user1.id,
            role: 'OWNER',
          },
          {
            userId: user2.id,
            role: 'ADMIN',
          },
          {
            userId: user3.id,
            role: 'MEMBER',
          },
        ],
      },
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Building a cross-platform mobile application for iOS and Android',
      createdById: user2.id,
      members: {
        create: [
          {
            userId: user2.id,
            role: 'OWNER',
          },
          {
            userId: user1.id,
            role: 'ADMIN',
          },
          {
            userId: user3.id,
            role: 'MEMBER',
          },
        ],
      },
    },
  })

  console.log('✅ Projects created')

  // Create tasks for project 1
  const tasks1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage design',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        projectId: project1.id,
        createdById: user1.id,
        assignedToId: user2.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement responsive navigation',
        description: 'Build the navigation component with mobile-first approach',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        projectId: project1.id,
        createdById: user1.id,
        assignedToId: user3.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up content management system',
        description: 'Integrate CMS for easy content updates',
        status: 'DONE',
        priority: 'LOW',
        projectId: project1.id,
        createdById: user1.id,
        assignedToId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Optimize page loading speed',
        description: 'Implement performance optimizations and lazy loading',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        projectId: project1.id,
        createdById: user2.id,
        assignedToId: user3.id,
      },
    }),
  ])

  // Create tasks for project 2
  const tasks2 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Set up React Native project',
        description: 'Initialize the React Native project with proper structure',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project2.id,
        createdById: user2.id,
        assignedToId: user2.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design user authentication flow',
        description: 'Create login and registration screens with validation',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        projectId: project2.id,
        createdById: user2.id,
        assignedToId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement push notifications',
        description: 'Set up Firebase for push notifications',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        projectId: project2.id,
        createdById: user2.id,
        assignedToId: user3.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create app store listings',
        description: 'Prepare screenshots and descriptions for app stores',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        projectId: project2.id,
        createdById: user1.id,
        assignedToId: user1.id,
      },
    }),
  ])

  console.log('✅ Tasks created')

  // Create some comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great progress on the design! The wireframes look really good.',
        taskId: tasks1[0].id,
        userId: user1.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'I have some feedback on the navigation structure. Let me know when you want to discuss.',
        taskId: tasks1[1].id,
        userId: user2.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'The CMS integration is working perfectly. Ready for content migration.',
        taskId: tasks1[2].id,
        userId: user3.id,
      },
    }),
  ])

  // Create project discussions
  await Promise.all([
    prisma.projectDiscussion.create({
      data: {
        title: 'Design System Guidelines',
        content: 'We need to establish consistent design patterns for the website redesign. Let\'s discuss color schemes, typography, and component standards.',
        projectId: project1.id,
        userId: user1.id,
      },
    }),
    prisma.projectDiscussion.create({
      data: {
        title: 'Mobile App Architecture',
        content: 'I\'d like to discuss the overall architecture for the mobile app. Should we go with a monorepo structure or separate repositories?',
        projectId: project2.id,
        userId: user2.id,
      },
    }),
  ])

  // Create some notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Task Assigned',
        message: 'You have been assigned a new task: Design new homepage layout',
        type: 'TASK_ASSIGNED',
        userId: user2.id,
      },
    }),
    prisma.notification.create({
      data: {
        title: 'Task Updated',
        message: 'Task "Set up React Native project" has been completed',
        type: 'TASK_UPDATED',
        userId: user1.id,
      },
    }),
    prisma.notification.create({
      data: {
        title: 'New Discussion',
        message: 'New discussion started: Design System Guidelines',
        type: 'DISCUSSION_ADDED',
        userId: user2.id,
      },
    }),
  ])

  console.log('✅ Comments, discussions, and notifications created')
  console.log('🎉 Seed completed successfully!')

  console.log('\n📋 Demo Accounts:')
  console.log('Email: john.doe@example.com | Password: password123')
  console.log('Email: jane.smith@example.com | Password: password123')
  console.log('Email: mike.wilson@example.com | Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
