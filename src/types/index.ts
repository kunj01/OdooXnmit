export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
  createdById: string
  members: ProjectMember[]
  tasks: Task[]
  projectDiscussions: ProjectDiscussion[]
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: Date
  user: User
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  projectId: string
  createdById: string
  assignedToId: string | null
  project: Project
  createdBy: User
  assignedTo: User | null
  comments: Comment[]
  taskDiscussions: TaskDiscussion[]
}

export interface Comment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  taskId: string
  userId: string
  user: User
}

export interface ProjectDiscussion {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  projectId: string
  userId: string
  user: User
}

export interface TaskDiscussion {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  taskId: string
  userId: string
  user: User
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'PROJECT_INVITED' | 'COMMENT_ADDED' | 'DISCUSSION_ADDED'
  read: boolean
  createdAt: Date
  userId: string
}

export interface CreateProjectData {
  name: string
  description?: string
}

export interface CreateTaskData {
  title: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: Date
  assignedToId?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: Date
  assignedToId?: string
}
