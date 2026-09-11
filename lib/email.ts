import nodemailer from "nodemailer"
import { Resend } from "resend"

const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  (process.env.GMAIL_USER ? `DataCo-op <${process.env.GMAIL_USER}>` : "DataCo-op <onboarding@datacoop.in>")
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

// 1. Gmail SMTP Transporter via Nodemailer (100% Free)
function getMailTransporter() {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""), // removes spaces if any
      },
    })
  }
  return null
}

// 2. Resend Client (Alternative)
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Try Nodemailer (Gmail) first
  const transporter = getMailTransporter()
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      })
      console.log(`[EMAIL_SENT_NODEMAILER] Sent to ${to}, MessageId: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("[NODEMAILER_ERROR]", error)
      return { success: false, error }
    }
  }

  // Next, try Resend
  const resend = getResendClient()
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      })
      if (error) {
        console.error("[RESEND_ERROR]", error)
        return { success: false, error }
      }
      return { success: true, data }
    } catch (error) {
      console.error("[RESEND_EXCEPTION]", error)
      return { success: false, error }
    }
  }

  // Fallback dev preview if no email credentials configured
  console.warn("[EMAIL_SERVICE] Neither GMAIL_APP_PASSWORD nor RESEND_API_KEY configured. Preview:")
  console.log(`To: ${to} | Subject: ${subject}`)
  return { success: false, error: "No email service configured" }
}

/**
 * Send 6-Digit Email Verification Code (OTP) for Signup
 */
export async function sendVerificationCodeEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: `Your DataCo-op Verification Code: ${code}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; color: #1B3A5C; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #1B3A5C; padding: 32px; box-shadow: 0 4px 12px rgba(27, 58, 92, 0.08); }
          .header { text-align: center; border-bottom: 2px solid #EDE7DA; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #1B3A5C; margin: 0; }
          .subtitle { font-size: 14px; color: #5C6B73; margin-top: 6px; }
          .code-box { background: #F3EFE6; border: 2px dashed #D4A373; border-radius: 8px; padding: 18px; text-align: center; margin: 28px 0; }
          .code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1B3A5C; font-family: monospace; }
          .note { font-size: 13px; color: #6b7280; text-align: center; margin-top: 8px; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">DataCo-op</h1>
            <div class="subtitle">Verified Consumer Data Marketplace</div>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #2B2D42;">Hello,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #4A4E69;">Use the verification code below to verify your email address. This code will expire in <strong>10 minutes</strong>.</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="note">Enter this 6-digit code on the registration screen.</div>
          </div>

          <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">If you didn't request this code, please safely ignore this email.</p>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} DataCo-op &bull; India's First Fair-Data Marketplace
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Send 6-Digit Email Login OTP (Passwordless Login)
 */
export async function sendLoginOtpEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: `DataCo-op Login Code: ${code}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; color: #1B3A5C; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #1B3A5C; padding: 32px; box-shadow: 0 4px 12px rgba(27, 58, 92, 0.08); }
          .header { text-align: center; border-bottom: 2px solid #EDE7DA; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #1B3A5C; margin: 0; }
          .subtitle { font-size: 14px; color: #5C6B73; margin-top: 6px; }
          .code-box { background: #EBF3FA; border: 2px dashed #1B3A5C; border-radius: 8px; padding: 18px; text-align: center; margin: 28px 0; }
          .code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1B3A5C; font-family: monospace; }
          .note { font-size: 13px; color: #5C6B73; text-align: center; margin-top: 8px; }
          .security-badge { background: #FEF3C7; border-left: 4px solid #D97706; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #92400E; margin-top: 20px; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">DataCo-op</h1>
            <div class="subtitle">Secure One-Time Login Code</div>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #2B2D42;">Hello,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #4A4E69;">You requested a passwordless login code for your DataCo-op account. Enter this code to sign in instantly:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="note">Valid for 10 minutes. Never share this code with anyone.</div>
          </div>

          <div class="security-badge">
            <strong>Security Notice:</strong> DataCo-op staff will never ask you for your login code.
          </div>

          <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-top: 24px;">If you did not request this login code, you can ignore this email safely.</p>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} DataCo-op &bull; India's First Fair-Data Marketplace
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Send Password Reset Code Email
 */
export async function sendPasswordResetEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: `Reset your DataCo-op Password: ${code}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; color: #1B3A5C; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #1B3A5C; padding: 32px; box-shadow: 0 4px 12px rgba(27, 58, 92, 0.08); }
          .header { text-align: center; border-bottom: 2px solid #EDE7DA; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #1B3A5C; margin: 0; }
          .subtitle { font-size: 14px; color: #5C6B73; margin-top: 6px; }
          .code-box { background: #FEF2F2; border: 2px dashed #EF4444; border-radius: 8px; padding: 18px; text-align: center; margin: 28px 0; }
          .code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #991B1B; font-family: monospace; }
          .note { font-size: 13px; color: #991B1B; text-align: center; margin-top: 8px; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">DataCo-op</h1>
            <div class="subtitle">Password Reset Request</div>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #2B2D42;">Hello,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #4A4E69;">We received a request to reset the password for your account. Use the code below to choose a new password:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="note">This password reset code will expire in 10 minutes.</div>
          </div>

          <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">If you did not request a password reset, please change your password immediately or contact our security team.</p>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} DataCo-op &bull; India's First Fair-Data Marketplace
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Send Password Changed Confirmation Email
 */
export async function sendPasswordChangedEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: `Security Alert: Your DataCo-op Password Was Changed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; color: #1B3A5C; }
          .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #1B3A5C; padding: 28px; box-shadow: 0 4px 12px rgba(27, 58, 92, 0.08); }
          .title { font-size: 20px; font-weight: 800; color: #1B3A5C; margin-top: 0; }
          .info-box { background: #ECFDF5; border-left: 4px solid #10B981; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #065F46; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 class="title">Password Successfully Changed</h2>
          <p style="font-size: 14px; color: #4A4E69;">Hi ${name || "there"},</p>
          <p style="font-size: 14px; color: #4A4E69;">Your DataCo-op account password was successfully updated on <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.</p>
          
          <div class="info-box">
            <strong>Account:</strong> ${email}<br>
            <strong>Status:</strong> Password Updated
          </div>

          <p style="font-size: 13px; color: #6b7280;">If you made this change, no further action is needed. If you did NOT change your password, please reset it immediately.</p>
          
          <div class="footer">
            DataCo-op Security Team &bull; ${FROM_EMAIL}
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Send Welcome Email on Signup / First Sign-in
 */
export async function sendWelcomeEmail(email: string, name: string, role: string = "USER") {
  const isBrand = role === "BRAND"
  const dashboardLink = isBrand ? `${APP_URL}/brand/dashboard` : `${APP_URL}/dashboard`

  return sendEmail({
    to: email,
    subject: `Welcome to DataCo-op, ${name || "Member"}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; color: #1B3A5C; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #1B3A5C; padding: 32px; box-shadow: 0 4px 12px rgba(27, 58, 92, 0.08); }
          .header { text-align: center; border-bottom: 2px solid #EDE7DA; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 26px; font-weight: 800; color: #1B3A5C; margin: 0; }
          .btn { display: inline-block; background-color: #1B3A5C; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px; margin: 20px 0; }
          .step { background: #F8F6F0; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; }
          .step-title { font-weight: 700; color: #1B3A5C; font-size: 14px; }
          .step-desc { font-size: 13px; color: #4A4E69; margin-top: 4px; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">Welcome to DataCo-op! 🎉</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #2B2D42;">Hi <strong>${name || "there"}</strong>,</p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #4A4E69;">
            ${
              isBrand
                ? "Thank you for joining DataCo-op. You can now commission research studies, access high-intent consumer cohorts, and receive real-time validated market insights."
                : "Thank you for joining DataCo-op — India's first verified consumer data marketplace where your purchase data earns you real payouts."
            }
          </p>

          ${
            !isBrand
              ? `
              <div style="margin: 24px 0;">
                <div class="step">
                  <div class="step-title">1. Verify Purchases</div>
                  <div class="step-desc">Upload bills or receipts from Amazon, Flipkart, Swiggy, and Zomato.</div>
                </div>
                <div class="step">
                  <div class="step-title">2. Get Matched with Research Surveys</div>
                  <div class="step-desc">Brands pay ₹100–₹500+ for feedback tailored to your authentic buying habits.</div>
                </div>
                <div class="step">
                  <div class="step-title">3. Instant UPI Payouts</div>
                  <div class="step-desc">Direct cashouts to your bank or UPI ID once your wallet reaches ₹500.</div>
                </div>
              </div>
              `
              : ""
          }

          <div style="text-align: center;">
            <a href="${dashboardLink}" class="btn">Go to Your Dashboard &rarr;</a>
          </div>

          <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-top: 24px;">
            If you have any questions or need assistance, reply directly to this email.
          </p>
          
          <div class="footer">
            Sent by DataCo-op &bull; ${FROM_EMAIL}
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Send Sign-in / Login Alert Email
 */
export async function sendLoginAlertEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: `Security Alert: New Sign-in to your DataCo-op Account`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 20px; color: #1B3A5C; }
          .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #1B3A5C; padding: 28px; box-shadow: 0 4px 12px rgba(27, 58, 92, 0.08); }
          .title { font-size: 20px; font-weight: 800; color: #1B3A5C; margin-top: 0; }
          .info-box { background: #F8F6F0; border-left: 4px solid #1B3A5C; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 class="title">New Sign-in Detected</h2>
          <p style="font-size: 14px; color: #4A4E69;">Hi ${name || "there"},</p>
          <p style="font-size: 14px; color: #4A4E69;">We noticed a successful sign-in to your DataCo-op account on <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.</p>
          
          <div class="info-box">
            <strong>Account:</strong> ${email}<br>
            <strong>Status:</strong> Authenticated Successfully
          </div>

          <p style="font-size: 13px; color: #6b7280;">If this was you, no action is required. If you did not sign in, please secure your account immediately.</p>
          
          <div class="footer">
            DataCo-op Security Team &bull; ${FROM_EMAIL}
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
