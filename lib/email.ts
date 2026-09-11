import nodemailer from "nodemailer"
import { Resend } from "resend"
import path from "path"
import fs from "fs"

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

/**
 * 1. Gmail SMTP Transporter
 */
function getMailTransporter() {
  const user = (process.env.GMAIL_USER || "").replace(/^["']|["']$/g, "").trim()
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/["'\s]/g, "").trim()

  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    })
  }
  return null
}

/**
 * 2. Resend Client (Alternative)
 */
function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || "").replace(/^["']|["']$/g, "").trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Core Email Dispatcher with Anti-Spam Headers & Embedded Logo Attachment
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const cleanTo = to.toLowerCase().trim()
  const user = (process.env.GMAIL_USER || "").replace(/^["']|["']$/g, "").trim()
  const fromName = "DataCo-op"
  const fromAddress = user || "onboarding@datacoop.in"

  // Plaintext version (if not provided, strip HTML tags)
  const plainText =
    text ||
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()

  // Resolve logo path for inline CID embedding
  const logoPath = path.join(process.cwd(), "public", "logo.png")
  const hasLogo = fs.existsSync(logoPath)

  const attachments = hasLogo
    ? [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "datacoop-logo",
        },
      ]
    : []

  // 1. Try Nodemailer (Gmail SMTP)
  const transporter = getMailTransporter()
  if (transporter && user) {
    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: cleanTo,
        replyTo: fromAddress,
        subject,
        text: plainText,
        html,
        attachments,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          "Importance": "high",
          "List-Unsubscribe": `<mailto:${fromAddress}?subject=unsubscribe>`,
          "X-Entity-Ref-ID": `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          "Feedback-ID": "transactional:datacoop:security",
        },
      })
      console.log(`[EMAIL_SENT_GMAIL] Successfully delivered to ${cleanTo}, MessageId: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("[GMAIL_SEND_ERROR]", error)
    }
  }

  // 2. Try Resend if configured
  const resend = getResendClient()
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromAddress}>`,
        to: cleanTo,
        subject,
        text: plainText,
        html,
      })
      if (error) {
        console.error("[RESEND_ERROR]", error)
        return { success: false, error }
      }
      console.log(`[EMAIL_SENT_RESEND] Sent to ${cleanTo}`)
      return { success: true, data }
    } catch (error) {
      console.error("[RESEND_EXCEPTION]", error)
      return { success: false, error }
    }
  }

  // 3. Fallback preview
  console.warn(`[EMAIL_FALLBACK] Simulated delivery to ${cleanTo}: ${subject}`)
  return { success: false, error: "No email service configured" }
}

/**
 * Reusable Website-Themed Email Shell
 */
function renderEmailShell({
  preheader,
  title,
  subtitle,
  children,
}: {
  preheader: string
  title: string
  subtitle?: string
  children: string
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #F4F1E9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1B3A5C;">
      
      <!-- Hidden Preheader text for inbox preview snippet -->
      <div style="display: none; font-size: 1px; color: #F4F1E9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader}
      </div>

      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 540px; width: 100%; background: #ffffff; border: 3px solid #1B3A5C; border-radius: 12px; box-shadow: 6px 6px 0px 0px #1B3A5C; overflow: hidden;" border="0" cellspacing="0" cellpadding="0">
              
              <!-- Barber Pole Vintage Accent Strip -->
              <tr>
                <td style="height: 6px; background: repeating-linear-gradient(90deg, #E3474F 0 12px, #FFFFFF 12px 24px, #1B3A5C 24px 36px, #FFFFFF 36px 48px);"></td>
              </tr>

              <!-- Header with Official DataCo-op Logo -->
              <tr>
                <td style="padding: 26px 24px 18px 24px; text-align: center; border-bottom: 2px dashed #EDE7DA;">
                  <img src="cid:datacoop-logo" alt="DataCo-op Official Logo" width="70" height="78" style="display: block; margin: 0 auto 10px auto; border: 0;" />
                  <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #1B3A5C; text-transform: uppercase; font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;">
                    DataCo-op
                  </div>
                  <div style="display: inline-block; margin-top: 6px; padding: 3px 10px; background-color: #1B3A5C; color: #F4F1E9; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 4px; font-family: monospace;">
                    Verified Fair-Data Marketplace &bull; Est. 2024
                  </div>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 28px 26px 20px 26px;">
                  ${children}
                </td>
              </tr>

              <!-- Footer with DPDP Compliance & Brand Stamp -->
              <tr>
                <td style="padding: 20px 24px; background-color: #F8F6F0; border-top: 2px dashed #EDE7DA; text-align: center;">
                  <div style="font-size: 12px; font-weight: 800; color: #1B3A5C; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                    DataCo-op &bull; Fair-Data Marketplace
                  </div>
                  <div style="font-size: 11px; color: #5B6472; line-height: 1.6;">
                    Empowering verified consumers with direct cash payouts & fair data sovereignty.
                  </div>
                  <div style="font-size: 10px; color: #8C98A4; margin-top: 10px; font-family: monospace;">
                    DPDP Act (2023) Compliant &bull; 256-Bit Encrypted &bull; Handcrafted by P.K Creative Agency
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * 1. Send 6-Digit Email Verification Code (OTP) for Signup
 */
export async function sendVerificationCodeEmail(email: string, code: string) {
  const subject = `[DataCo-op] Your Verification Code: ${code}`
  const text = `DATACO-OP | Verified Consumer Data Marketplace\n\nHello,\n\nYour 6-digit email verification code is: ${code}\n\nThis code will expire in 10 minutes. Enter this code on the registration screen to complete your account setup.\n\nIf you did not request this code, you can safely disregard this email.\n\n© 2026 DataCo-op. All rights reserved.`

  const html = renderEmailShell({
    preheader: `Your DataCo-op email verification code is ${code}. Valid for 10 minutes.`,
    title: "Verify your DataCo-op Account",
    children: `
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #1B3A5C;">Welcome to DataCo-op! 🎉</h2>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        Thank you for joining India's first verified consumer data marketplace. Use the verification code below to verify your email address and activate your account:
      </p>

      <!-- Ticket Stamp Code Box -->
      <div style="background-color: #F8F6F0; border: 2px dashed #1B3A5C; border-radius: 8px; padding: 22px 16px; text-align: center; margin: 24px 0;">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #1B3A5C; line-height: 1;">
          ${code}
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #E3474F; margin-top: 10px; font-family: monospace; letter-spacing: 0.5px;">
          ⏱ VALID FOR 10 MINUTES &bull; SINGLE USE
        </div>
      </div>

      <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 12px 14px; border-radius: 4px; margin: 20px 0;">
        <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 2px;">
          🔒 Security Notice
        </div>
        <div style="font-size: 12px; color: #78350F; line-height: 1.5;">
          Never share this code with anyone. DataCo-op team members will never ask for your verification code.
        </div>
      </div>

      <p style="font-size: 12px; color: #8C98A4; line-height: 1.5; margin: 20px 0 0 0;">
        If you didn't create an account with DataCo-op, you can safely ignore this email.
      </p>
    `,
  })

  return sendEmail({ to: email, subject, text, html })
}

/**
 * 2. Send 6-Digit Email Login OTP (Passwordless Login)
 */
export async function sendLoginOtpEmail(email: string, code: string) {
  const subject = `[DataCo-op] Login Passcode: ${code}`
  const text = `DATACO-OP | Security Login Code\n\nHello,\n\nYour one-time sign-in code is: ${code}\n\nThis code will expire in 10 minutes. Use it on the DataCo-op login screen to authenticate instantly.\n\nIf you did not attempt to sign in, please secure your account immediately.\n\n© 2026 DataCo-op. All rights reserved.`

  const html = renderEmailShell({
    preheader: `Your DataCo-op one-time sign in code is ${code}. Valid for 10 minutes.`,
    title: "DataCo-op One-Time Login Code",
    children: `
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #1B3A5C;">One-Time Sign-In Passcode</h2>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        You requested a passwordless login code for your DataCo-op account. Enter the 6-digit passcode below to sign in instantly:
      </p>

      <!-- Ticket Stamp Code Box -->
      <div style="background-color: #EBF3FA; border: 2px dashed #1B3A5C; border-radius: 8px; padding: 22px 16px; text-align: center; margin: 24px 0;">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #1B3A5C; line-height: 1;">
          ${code}
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #1B3A5C; margin-top: 10px; font-family: monospace; letter-spacing: 0.5px;">
          ⏱ EXPIRES IN 10 MINUTES &bull; ONE-TIME PASSCODE
        </div>
      </div>

      <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 12px 14px; border-radius: 4px; margin: 20px 0;">
        <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 2px;">
          🔒 Security Notice
        </div>
        <div style="font-size: 12px; color: #78350F; line-height: 1.5;">
          DataCo-op staff will <strong>never</strong> contact you to ask for this code. If you did not request this login, please secure your email account.
        </div>
      </div>
    `,
  })

  return sendEmail({ to: email, subject, text, html })
}

/**
 * 3. Send Password Reset / Recovery Code Email
 */
export async function sendPasswordResetEmail(email: string, code: string) {
  const subject = `[DataCo-op] Password Recovery Code: ${code}`
  const text = `DATACO-OP | Account Recovery\n\nHello,\n\nWe received a request to reset the password for your DataCo-op account.\n\nYour 6-digit recovery code is: ${code}\n\nThis code will expire in 10 minutes. Enter this code to select a new password.\n\nIf you did not request a password reset, please secure your account immediately.\n\n© 2026 DataCo-op. All rights reserved.`

  const html = renderEmailShell({
    preheader: `Your DataCo-op password recovery code is ${code}. Valid for 10 minutes.`,
    title: "DataCo-op Password Recovery",
    children: `
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #1B3A5C;">Password Reset Request</h2>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        We received a request to recover or reset the password associated with this email address. Use the 6-digit recovery code below:
      </p>

      <!-- Ticket Stamp Code Box (Red Accent for Recovery) -->
      <div style="background-color: #FEF2F2; border: 2px dashed #E3474F; border-radius: 8px; padding: 22px 16px; text-align: center; margin: 24px 0;">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #E3474F; line-height: 1;">
          ${code}
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #991B1B; margin-top: 10px; font-family: monospace; letter-spacing: 0.5px;">
          ⏱ EXPIRES IN 10 MINUTES &bull; RECOVERY PIN
        </div>
      </div>

      <div style="background-color: #F8F6F0; border-left: 4px solid #1B3A5C; padding: 12px 14px; border-radius: 4px; margin: 20px 0;">
        <div style="font-size: 12px; color: #4A4E69; line-height: 1.5;">
          If you did not request a password reset, please ignore this email. Your current password remains safe and unchanged.
        </div>
      </div>
    `,
  })

  return sendEmail({ to: email, subject, text, html })
}

/**
 * 4. Send Password Changed Confirmation Email
 */
export async function sendPasswordChangedEmail(email: string, name?: string) {
  const subject = `[DataCo-op] Security Alert: Password Changed`
  const text = `Hi ${name || "Member"},\n\nYour DataCo-op account password was successfully updated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.\n\nAccount: ${email}\nStatus: Password Updated\n\nIf you made this change, no action is needed. If you did not authorize this change, please reset your password immediately.\n\n- The DataCo-op Security Team`

  const html = renderEmailShell({
    preheader: `Your DataCo-op account password was successfully updated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.`,
    title: "Password Successfully Changed",
    children: `
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #1B3A5C;">Password Successfully Changed</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        Hi <strong>${name || "Member"}</strong>,
      </p>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        The password for your DataCo-op account was successfully updated on <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.
      </p>

      <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #065F46;">
        <strong>Account:</strong> ${email}<br>
        <strong>Status:</strong> Password Updated Successfully<br>
        <strong>Security Check:</strong> All active sessions secured
      </div>

      <p style="font-size: 12px; color: #8C98A4; line-height: 1.5; margin: 20px 0 0 0;">
        If you made this change, you're all set! If you did <strong>NOT</strong> change your password, please contact our support desk immediately.
      </p>
    `,
  })

  return sendEmail({ to: email, subject, text, html })
}

/**
 * 5. Send Welcome Email on Signup / First Sign-in
 */
export async function sendWelcomeEmail(email: string, name: string, role: string = "USER") {
  const isBrand = role === "BRAND"
  const dashboardLink = isBrand ? `${APP_URL}/brand/dashboard` : `${APP_URL}/dashboard`
  const subject = `[DataCo-op] Welcome to the Data Marketplace, ${name || "Member"}! 🎉`
  const text = `Hi ${name || "Member"},\n\nWelcome to DataCo-op! You can now access your dashboard at ${dashboardLink}.\n\n- The DataCo-op Team`

  const html = renderEmailShell({
    preheader: `Welcome to DataCo-op! Start verifying purchases and earning direct UPI cash payouts.`,
    title: "Welcome to DataCo-op",
    children: `
      <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #1B3A5C;">Welcome to DataCo-op! 🎉</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        Hi <strong>${name || "Member"}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        ${
          isBrand
            ? "Thank you for joining DataCo-op as an official brand partner. You can now commission verified consumer research studies, access high-intent cohorts, and receive real-time validated market insights."
            : "Thank you for joining DataCo-op — India's first verified consumer data marketplace where your authentic purchase history earns you direct UPI cash payouts."
        }
      </p>

      ${
        !isBrand
          ? `
          <div style="margin: 22px 0;">
            <div style="background: #F8F6F0; border-left: 4px solid #1B3A5C; border-radius: 4px; padding: 12px 16px; margin-bottom: 10px;">
              <div style="font-weight: 800; color: #1B3A5C; font-size: 13px;">1. Verify Purchases</div>
              <div style="font-size: 12px; color: #4A4E69; margin-top: 3px;">Upload receipts from Amazon, Flipkart, Swiggy, and Zomato.</div>
            </div>
            <div style="background: #F8F6F0; border-left: 4px solid #E3474F; border-radius: 4px; padding: 12px 16px; margin-bottom: 10px;">
              <div style="font-weight: 800; color: #1B3A5C; font-size: 13px;">2. Complete Matched Surveys</div>
              <div style="font-size: 12px; color: #4A4E69; margin-top: 3px;">Brands pay ₹100–₹500+ for feedback tailored to your buying habits.</div>
            </div>
            <div style="background: #F8F6F0; border-left: 4px solid #10B981; border-radius: 4px; padding: 12px 16px;">
              <div style="font-weight: 800; color: #1B3A5C; font-size: 13px;">3. Instant UPI Payouts</div>
              <div style="font-size: 12px; color: #4A4E69; margin-top: 3px;">Direct cashouts to your UPI ID once your wallet reaches ₹500.</div>
            </div>
          </div>
          `
          : ""
      }

      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${dashboardLink}" style="display: inline-block; background-color: #1B3A5C; color: #ffffff !important; padding: 14px 32px; border-radius: 6px; font-weight: 800; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 3px 3px 0px 0px #E3474F;">
          Go to Your Dashboard &rarr;
        </a>
      </div>
    `,
  })

  return sendEmail({ to: email, subject, text, html })
}

/**
 * 6. Send Sign-in / Login Alert Email
 */
export async function sendLoginAlertEmail(email: string, name: string) {
  const subject = `[DataCo-op] Security Alert: New Sign-in Detected`
  const text = `Hi ${name || "Member"},\n\nWe noticed a successful sign-in to your DataCo-op account on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.\n\nAccount: ${email}\nStatus: Authenticated Successfully\n\nIf this was you, no action is required. If you did not sign in, please secure your account immediately.\n\n- The DataCo-op Security Team`

  const html = renderEmailShell({
    preheader: `New sign-in detected for ${email} on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.`,
    title: "New Sign-in Detected",
    children: `
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #1B3A5C;">New Sign-In Detected</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        Hi <strong>${name || "Member"}</strong>,
      </p>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #4A4E69;">
        We noticed a successful sign-in to your DataCo-op account on <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.
      </p>

      <div style="background-color: #F8F6F0; border-left: 4px solid #1B3A5C; padding: 14px 16px; border-radius: 4px; margin: 20px 0; font-size: 13px;">
        <strong>Account:</strong> ${email}<br>
        <strong>Status:</strong> Authenticated Successfully<br>
        <strong>Session:</strong> Active & Encrypted
      </div>

      <p style="font-size: 12px; color: #8C98A4; line-height: 1.5; margin: 20px 0 0 0;">
        If this was you, no action is needed. If you did not sign in, please reset your password immediately.
      </p>
    `,
  })

  return sendEmail({ to: email, subject, text, html })
}
