# datacoop

A verified consumer data marketplace built with Next.js 14, TypeScript, and Tailwind CSS.

## Project Overview

**datacoop** is a platform for verified consumer data marketplace, enabling secure and privacy-preserving data sharing and transactions.

## Tech Stack

- **Framework**: Next.js 14.1.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI primitives
- **Authentication**: NextAuth.js with Prisma adapter
- **Database**: Prisma ORM with PostgreSQL
- **APIs**: Supabase JS, Axios
- **Utilities**: Date-fns, Zod (validation), UUID, bcryptjs
- **State Management**: Zustand
- **Charts/Visualization**: Lucide React icons

## Prerequisites

- Node.js 20.x or later
- PostgreSQL database
- Supabase account (for auth and storage)
- Prisma ORM

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection string
- Supabase credentials
- NextAuth settings

### 3. Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Next.js |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio UI |
| `npm run seed` | Seed the database with sample data |

## Project Structure

```
app/          # Next.js app router pages and layouts
components/   # Reusable UI components
lib/          # Utility functions and helpers
services/     # External service integrations
prisma/       # Database schema and migrations
public/       # Static assets
styles/       # Global styles and Tailwind config
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [NextAuth.js](https://next-auth.js.org)
- [TypeScript](https://typescriptlang.org)