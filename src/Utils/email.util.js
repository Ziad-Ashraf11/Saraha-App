import nodemailer from "nodemailer";
import {
  MAIL_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from "../../config/config.service.js";

export const sendVerificationEmail = async (email, code) => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[DEV ONLY] Email verification code for ${email}: ${code}`);
      return { delivered: false, developmentCode: code };
    }
    throw new Error("Email delivery is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Verify your Saraha account",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
  return { delivered: true };
};
