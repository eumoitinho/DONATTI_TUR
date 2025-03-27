import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions, DefaultSession } from "next-auth"
import { redis, REDIS_KEYS } from "@/lib/redis"
import type { User } from "@/types/user"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userAgent: { label: "User Agent", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Initialize Redis if needed
          await initializeRedisIfNeeded()

          // Get users from Redis
          const users = (await redis.get<User[]>(REDIS_KEYS.USERS)) || []

          // Find user by email and password
          const user = users.find(
            (u) => u.email === credentials.email && u.password === credentials.password && u.active,
          )

          if (user) {
            // Update last login
            const updatedUsers = users.map((u) => {
              if (u.id === user.id) {
                return {
                  ...u,
                  lastLogin: new Date().toISOString(),
                }
              }
              return u
            })

            // Save updated users
            await redis.set(REDIS_KEYS.USERS, updatedUsers)

            // Record login session
            const sessions = (await redis.get<any[]>(REDIS_KEYS.USER_SESSIONS)) || []
            sessions.push({
              userId: user.id,
              email: user.email,
              loginTime: new Date().toISOString(),
              userAgent: credentials.userAgent || "Unknown",
            })
            await redis.set(REDIS_KEYS.USER_SESSIONS, sessions)

            // Return user data for session
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }
        } catch (error) {
          console.error("Error during authentication:", error)
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          email: token.email as string,
          name: token.name as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.AUTH_SECRET || "your-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
}

// Helper function to initialize Redis with default users if needed
async function initializeRedisIfNeeded() {
  const usersExist = await redis.exists(REDIS_KEYS.USERS)

  if (!usersExist) {
    // Create default admin user
    const defaultAdmin = {
      id: "admin-default",
      email: "admin@donatti.com",
      name: "Administrador",
      password: "lemonde123",
      role: "admin",
      createdAt: new Date().toISOString(),
      active: true,
    }

    // Create default agent user
    const defaultAgent = {
      id: "agent-default",
      email: "agente@donatti.com",
      name: "Agente de Turismo",
      password: "lemonde123",
      role: "agent",
      createdAt: new Date().toISOString(),
      active: true,
    }

    await redis.set(REDIS_KEYS.USERS, [defaultAdmin, defaultAgent])
    console.log("Redis initialized with default users")
  }
}

