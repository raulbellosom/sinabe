import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  const requireAuth = process.env.SMTP_REQUIRE_AUTH === "true";

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: requireAuth
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
    tls: {
      rejectUnauthorized: false, // Sometimes needed for self-signed certs or internal relays
    },
  };

  return nodemailer.createTransport(config);
};

export const sendCustodyEmail = async (to, subject, text, attachments = []) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.CUSTODY_FROM || '"Resguardo TI" <no-reply@sinabe.com>',
      to,
      cc: process.env.CUSTODY_DIST_LIST,
      subject,
      text,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw error to avoid blocking the response if email fails?
    // Or throw to notify user?
    // Let's log and rethrow so controller knows.
    throw error;
  }
};
