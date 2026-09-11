import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
  interface User {
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Check Admin table first
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        })

        if (admin?.passwordHash) {
          const valid = await bcrypt.compare(credentials.password, admin.passwordHash)
          if (valid) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name ?? "Admin",
              role: "ADMIN",
            }
          }
        }

        // Check User table
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (user?.passwordHash) {
          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (valid) {
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              role: user.role,
            }
          }
        }

        // Check Brand table
        const brand = await prisma.brand.findUnique({
          where: { email: credentials.email },
        })

        if (brand?.passwordHash) {
          const valid = await bcrypt.compare(credentials.password, brand.passwordHash)
          if (valid) {
            return {
              id: brand.id,
              email: brand.email,
              name: brand.name,
              role: "BRAND",
            }
          }
        }

        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false

        try {
          // Check if user already exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                image: user.image || "",
                googleId: account.providerAccountId,
                role: "USER",
                status: "ACTIVE",
              },
            })
          } else if (!dbUser.googleId) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                googleId: account.providerAccountId,
                image: dbUser.image || user.image,
              },
            })
          }

          user.id = dbUser.id
          user.role = dbUser.role
          return true
        } catch (error) {
          console.error("Error during Google signIn:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
