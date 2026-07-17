import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendApprovalEmail(email: string, fullName: string): Promise<void> {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn("SMTP_USER not configured, email disabled");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { color: #050a0f; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subheader { color: #666; font-size: 14px; margin-bottom: 20px; }
            .content { color: #333; line-height: 1.6; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #050a0f; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">🚀 Your Account Is Approved!</div>
              <div class="subheader">Welcome to PROJECT X MARKET</div>
              
              <div class="content">
                <p>Hi ${fullName},</p>
                
                <p>Great news! Your account has been approved by our administrative team.</p>
                
                <p><strong>You can now:</strong></p>
                <ul>
                  <li>✅ View real-time PRJX stock pricing</li>
                  <li>✅ Make deposits and fund your account</li>
                  <li>✅ Purchase PRJX shares</li>
                  <li>✅ Track your investment portfolio</li>
                  <li>✅ Access exclusive market news and insights</li>
                </ul>
                
                <p>Your investment journey starts now. Log in to your account and explore the opportunities waiting for you.</p>
              </div>
              
              <a href="${process.env.APP_URL || 'https://projectxmarket.com'}/dashboard" class="button">Go to Dashboard</a>
              
              <div class="footer">
                <p>If you didn't create this account or have any questions, please contact our support team.</p>
                <p>PROJECT X MARKET | Investment Platform</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "🎉 Your PROJECT X MARKET Account Has Been Approved!",
      html: htmlContent,
    });

    logger.info({ email, fullName }, "Approval email sent successfully");
  } catch (err) {
    logger.error({ err, email }, "Failed to send approval email");
    throw err;
  }
}

export async function sendRejectionEmail(email: string, fullName: string, reason?: string): Promise<void> {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn("SMTP_USER not configured, email disabled");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { color: #050a0f; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { color: #333; line-height: 1.6; margin: 20px 0; }
            .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">Account Status Update</div>
              
              <div class="content">
                <p>Hi ${fullName},</p>
                
                <p>Thank you for your interest in PROJECT X MARKET. Unfortunately, your account application has been declined at this time.</p>
                
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
                
                <p>If you believe this is an error or would like to discuss this decision, please contact our support team.</p>
              </div>
              
              <div class="footer">
                <p>PROJECT X MARKET | Investment Platform</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "PROJECT X MARKET - Account Application Status",
      html: htmlContent,
    });

    logger.info({ email, fullName }, "Rejection email sent successfully");
  } catch (err) {
    logger.error({ err, email }, "Failed to send rejection email");
    throw err;
  }
}
