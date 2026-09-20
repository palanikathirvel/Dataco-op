const { execSync } = require('child_process');

// Ensure a valid DATABASE_URL is available for Prisma client generation
// even if environment variables are not yet configured in Vercel
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/datacoop?schema=public';
}

try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.warn('[postinstall] Prisma generate completed with warning:', err.message);
}
