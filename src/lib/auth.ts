import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Demo users for testing
const demoUsers = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    password: 'password123'
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com', 
    name: 'Jane Smith',
    password: 'password123'
  },
  {
    id: 'user3',
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson', 
    password: 'password123'
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = demoUsers.find(u => u.email === credentials.email)
        
        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
