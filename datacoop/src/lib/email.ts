import { Resend } from "resend";
import { formatCurrency, formatDate } from "@/lib/utils";

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@datacoop.in";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  return sendEmail({
    to: userEmail,
    subject: "Welcome to DataCoop! 🎉",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a2e; margin: 0;">Welcome to DataCoop, ${userName}! 🎉</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Thanks for joining DataCoop — India's first verified consumer data marketplace.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Here's how to get started:</p>
        <ol style="font-size: 16px; line-height: 1.8; color: #333;">
          <li><strong>Verify a purchase</strong> — Upload a screenshot or forward an email receipt</li>
          <li><strong>Unlock cohorts</strong> — Verified purchases unlock relevant survey matches</li>
          <li><strong>Take surveys</strong> — Earn ₹100–500+ per survey from brands who value your opinion</li>
          <li><strong>Withdraw earnings</strong> — Cash out to UPI once you reach ₹500</li>
        </ol>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/dashboard/purchases" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Add Your First Purchase</a>
        </div>
        <p style="font-size: 14px; color: #666;">Your data, your control, your earnings.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">DataCoop | Verified Consumer Data Marketplace</p>
      </div>
    `,
  });
}

export async function sendBrandRegistrationEmail(brandEmail: string, brandName: string) {
  return sendEmail({
    to: brandEmail,
    subject: "Brand Registration Received — Under Review",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a2e;">Thanks for registering, ${brandName}! 🏢</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your brand account is now under review. Our team will verify your details and activate your account within 24 hours.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Once approved, you'll be able to:</p>
        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>Create targeted research studies</li>
          <li>Access verified purchaser audiences</li>
          <li>Build custom cohorts from real purchase data</li>
          <li>Get responses in hours, not weeks</li>
        </ul>
        <p style="font-size: 14px; color: #666;">We'll notify you as soon as your account is approved.</p>
      </div>
    `,
  });
}

export async function sendBrandApprovedEmail(brandEmail: string, brandName: string) {
  return sendEmail({
    to: brandEmail,
    subject: "🎉 Your Brand Account is Approved!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a2e;">You're Live, ${brandName}! 🎉</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your brand account has been approved. You can now create research studies and access verified consumer insights.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/brand/research/new" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Create Your First Study</a>
        </div>
      </div>
    `,
  });
}

export async function sendPurchaseVerifiedEmail(userEmail: string, userName: string, productName: string, purchaseId: string) {
  return sendEmail({
    to: userEmail,
    subject: "✅ Purchase Verified — New Cohorts Unlocked!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a2e;">Purchase Verified! ✅</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${userName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your <strong>${productName}</strong> purchase has been verified. This unlocks new cohort tags, making you eligible for more relevant, higher-paying surveys.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/dashboard" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Check Your Dashboard</a>
        </div>
      </div>
    `,
  });
}

export async function sendPurchaseRejectedEmail(userEmail: string, userName: string, productName: string, reason: string) {
  return sendEmail({
    to: userEmail,
    subject: "❌ Purchase Rejected",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Purchase Rejected</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${userName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your <strong>${productName}</strong> purchase could not be verified.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;"><strong>Reason:</strong> ${reason}</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">You can submit a new verification with a clearer screenshot or correct details.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/dashboard/purchases" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Try Again</a>
        </div>
      </div>
    `,
  });
}

export async function sendSurveyMatchEmail(userEmail: string, userName: string, brandName: string, payout: number, researchRequestId: string, estimatedMinutes: number) {
  return sendEmail({
    to: userEmail,
    subject: `🎯 New Survey: Earn ${formatCurrency(payout)} from ${brandName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a2e;">New Survey Matched for You! 🎯</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${userName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;"><strong>${brandName}</strong> is looking for your opinion and is willing to pay <strong style="color: #059669;">${formatCurrency(payout)}</strong> for ~${estimatedMinutes} minutes of your time.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/survey/${researchRequestId}" style="background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Start Survey & Earn</a>
        </div>
        <p style="font-size: 14px; color: #666;">This survey is available to a limited number of verified purchasers. Don't miss out!</p>
      </div>
    `,
  });
}

export async function sendSurveyCompletedEmail(userEmail: string, userName: string, payout: number) {
  return sendEmail({
    to: userEmail,
    subject: `✅ Survey Submitted — ${formatCurrency(payout)} Added to Wallet`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #059669;">Survey Submitted Successfully! ✅</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${userName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your response has been submitted. <strong style="color: #059669;">${formatCurrency(payout)}</strong> will be added to your wallet after brand review (usually within 24 hours).</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/dashboard" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Wallet</a>
        </div>
      </div>
    `,
  });
}

export async function sendPayoutProcessedEmail(userEmail: string, userName: string, amount: number, upiId: string) {
  return sendEmail({
    to: userEmail,
    subject: `💰 Payout Processed — ${formatCurrency(amount)} Sent to ${upiId}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #059669;">Payout Completed! 💰</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${userName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your withdrawal of <strong style="color: #059669;">${formatCurrency(amount)}</strong> has been sent to <strong>${upiId}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">The amount should reflect in your UPI account shortly.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/dashboard/wallet" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Transaction History</a>
        </div>
      </div>
    `,
  });
}

export async function sendLowBalanceEmail(brandEmail: string, brandName: string, balance: number, studyTitle: string) {
  return sendEmail({
    to: brandEmail,
    subject: `⚠️ Low Wallet Balance — ${studyTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Low Wallet Balance ⚠️</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${brandName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Your study <strong>${studyTitle}</strong> needs more funds to continue collecting responses.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Current balance: <strong>${formatCurrency(balance)}</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/brand/dashboard" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Add Funds Now</a>
        </div>
      </div>
    `,
  });
}

export async function sendResearchCompletedEmail(brandEmail: string, brandName: string, studyTitle: string, researchRequestId: string) {
  return sendEmail({
    to: brandEmail,
    subject: `📊 Study Complete: ${studyTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a2e;">Your Study is Complete! 📊</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${brandName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;"><strong>${studyTitle}</strong> has reached its sample size and is now complete.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/brand/research/${researchRequestId}" style="background: #1a1a2e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Results</a>
        </div>
      </div>
    `,
  });
}

export async function sendAdminNotificationEmail(adminEmail: string, subject: string, message: string) {
  return sendEmail({
    to: adminEmail,
    subject: `[Admin] ${subject}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Admin Notification</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/admin" style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Open Admin Panel</a>
        </div>
      </div>
    `,
  });
}