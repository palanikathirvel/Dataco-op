/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002']
    }
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'drive.google.com', 'i.imgur.com']
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAYX_KEY_ID: process.env.RAZORPAYX_KEY_ID,
    RAZORPAYX_KEY_SECRET: process.env.RAZORPAYX_KEY_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
  }
}

module.exports = nextConfig