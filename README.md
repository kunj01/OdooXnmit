# SynergySphere - Advanced Team Collaboration Platform

A comprehensive team collaboration platform for project management, task tracking, and communication built with Next.js, Prisma, and NextAuth.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with NextAuth
- 📊 **Project Management** - Create and manage projects with team members
- ✅ **Task Tracking** - Assign and track tasks with status updates
- 💬 **Real-time Communication** - Project discussions and task comments
- 🔔 **Notifications** - Get notified about task assignments and updates
- 👥 **Team Collaboration** - Invite team members with different roles

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB 4.4+ (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kunj01/OdooXnmit.git
   cd SynergySphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**

   **Option A: Local MongoDB**
   - Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start MongoDB service: `mongod` (or start as Windows service)
   - Verify connection: `mongosh` should connect to `mongodb://localhost:27017`

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update the DATABASE_URL

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=<your_mongoDB_url>
   NEXTAUTH_URL="http://localhost:5000"
   NEXTAUTH_SECRET="synergysphere-secure-jwt-secret-key-2024"
   ```

5. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:5000](http://localhost:5000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/projects/[id]/tasks` - Get project tasks
- `POST /api/projects/[id]/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]` - Mark notification as read

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── projects/          # Project pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── api-utils.ts      # API utility functions
└── types/                # TypeScript type definitions
```

## Database Schema

The application uses a MongoDB database with the following main models:

- **User** - User accounts and authentication
- **Project** - Project management
- **ProjectMember** - Project team membership
- **Task** - Task management and tracking
- **Comment** - Task comments
- **Notification** - User notifications
- **ProjectDiscussion** - Project discussions
- **TaskDiscussion** - Task discussions

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Route protection with middleware
- Input validation and sanitization
- NoSQL injection prevention with Prisma

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Database Management

- **View data**: Run `npm run db:studio` to open Prisma Studio
- **Schema changes**: Modify `prisma/schema.prisma` and run `npm run db:push`