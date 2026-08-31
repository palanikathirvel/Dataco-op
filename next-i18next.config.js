const { i18n } = require('next-i18next.config.js')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  env: {
    NEXT_PUBLIC_RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  }
}

module.exports = nextConfig