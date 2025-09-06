import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.wilson@example.com' },
      update: {},
      create: {
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        password: hashedPassword,
      },
    }),
  ])

  console.log('✅ Created users:', users.map(u => u.email))

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      name: 'Sample Project',
      description: 'A sample project for testing',
      createdById: users[0].id,
      members: {
        create: [
          {
            userId: users[0].id,
            role: 'OWNER',
          },
          {
            userId: users[1].id,
            role: 'MEMBER',
          },
          {
            userId: users[2].id,
            role: 'MEMBER',
          },
        ],
      },
    },
  })

  console.log('✅ Created project:', project.name)

  // Create some sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Setup project structure',
        description: 'Initialize the project with proper folder structure',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project.id,
        createdById: users[0].id,
        assignedToId: users[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement authentication',
        description: 'Set up user authentication and authorization',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project.id,
        createdById: users[0].id,
        assignedToId: users[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create user dashboard',
        description: 'Build the main dashboard interface',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project.id,
        createdById: users[1].id,
        assignedToId: users[0].id,
      },
    }),
  ])

  console.log('✅ Created tasks:', tasks.map(t => t.title))

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })