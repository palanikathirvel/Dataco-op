const { execSync } = require('child_process');

// Ensure a valid DATABASE_URL is available for Prisma client generation
// during Vercel build step
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/datacoop?schema=public';
}

console.log('[build] Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.warn('[build] Prisma generate completed with warning:', err.message);
}

console.log('[build] Running Next.js build...');
execSync('npx next build', { stdio: 'inherit', env: process.env });
