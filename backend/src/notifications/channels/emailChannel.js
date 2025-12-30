/**
 * Canal de Email para Notificaciones
 * Envía correos electrónicos basados en las reglas configuradas
 */
import nodemailer from "nodemailer";
import { db } from "../../lib/db.js";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Crea el transporter de Nodemailer
 */
const createTransporter = () => {
  const requireAuth = process.env.SMTP_REQUIRE_AUTH === "true";

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: requireAuth
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(config);
};

/**
 * Envía notificaciones por email
 */
export const sendNotificationEmail = async (rule, run, matches, summary) => {
  const deliveries = [];
  const transporter = createTransporter();

  // Agrupar destinatarios por rol (TO, CC, BCC)
  const recipients = await getEmailRecipients(rule.recipients);

  if (recipients.to.length === 0) {
    console.warn(`[EmailChannel] Regla ${rule.id}: Sin destinatarios TO`);
    return deliveries;
  }

  // Generar contenido del email
  const { subject, html, text } = generateEmailContent(rule, matches, summary);

  // Crear registro de delivery
  const delivery = await db.notificationDelivery.create({
    data: {
      ruleRunId: run.id,
      channel: "EMAIL",
      email: recipients.to.join(", "),
      status: "PENDING",
    },
  });

  try {
    const mailOptions = {
      from:
        process.env.NOTIFY_FROM ||
        process.env.CUSTODY_FROM ||
        '"Sinabe Notificaciones" <no-reply@sinabe.com>',
      to: recipients.to.join(", "),
      cc: recipients.cc.length > 0 ? recipients.cc.join(", ") : undefined,
      bcc: recipients.bcc.length > 0 ? recipients.bcc.join(", ") : undefined,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailChannel] Email enviado: ${info.messageId}`);

    // Actualizar delivery como enviado
    await db.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        attempts: 1,
      },
    });

    deliveries.push({ ...delivery, status: "SENT" });
  } catch (error) {
    console.error(`[EmailChannel] Error enviando email:`, error);

    await db.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "FAILED",
        errorMsg: error.message,
        attempts: 1,
      },
    });

    deliveries.push({ ...delivery, status: "FAILED", error: error.message });
  }

  return deliveries;
};

/**
 * Obtiene las direcciones de email de los destinatarios
 */
const getEmailRecipients = async (ruleRecipients) => {
  const result = { to: [], cc: [], bcc: [] };

  for (const recipient of ruleRecipients) {
    let email = null;

    if (recipient.kind === "EMAIL") {
      email = recipient.email;
    } else if (recipient.kind === "USER" && recipient.userId) {
      const user = await db.user.findUnique({
        where: { id: recipient.userId },
        select: { email: true },
      });
      email = user?.email;
    }

    if (email) {
      switch (recipient.emailRole) {
        case "TO":
          result.to.push(email);
          break;
        case "CC":
          result.cc.push(email);
          break;
        case "BCC":
          result.bcc.push(email);
          break;
      }
    }
  }

  return result;
};

/**
 * Genera el contenido del email basado en la regla y coincidencias
 */
const generateEmailContent = (rule, matches, summary) => {
  const dateStr = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });
  const subject = `Sinabe | ${rule.name} | ${dateStr}`;

  // Generar HTML basado en el tipo de regla
  const html = generateHtmlBody(rule, matches, summary);
  const text = generateTextBody(rule, matches, summary);

  return { subject, html, text };
};

/**
 * Genera el cuerpo HTML del email
 */
const generateHtmlBody = (rule, matches, summary) => {
  const appUrl = process.env.APP_URL || "http://localhost:5173";

  let itemsHtml = "";

  if (matches.length > 0) {
    itemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            ${
              summary.columns
                ?.map(
                  (col) =>
                    `<th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">${col.label}</th>`
                )
                .join("") || ""
            }
          </tr>
        </thead>
        <tbody>
          ${matches
            .map(
              (item, index) => `
            <tr style="background-color: ${
              index % 2 === 0 ? "#ffffff" : "#f9fafb"
            };">
              ${
                summary.columns
                  ?.map(
                    (col) =>
                      `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${
                        item[col.key] || "-"
                      }</td>`
                  )
                  .join("") || ""
              }
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${rule.name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📊 ${rule.name}</h1>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        ${
          rule.description
            ? `<p style="color: #6b7280; margin-bottom: 20px;">${rule.description}</p>`
            : ""
        }
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 20px;">
          <strong>Resumen:</strong> Se encontraron <strong>${
            matches.length
          }</strong> elemento(s) que coinciden con los criterios de esta regla.
        </div>

        ${itemsHtml}

        ${
          summary.link
            ? `
          <div style="margin-top: 20px;">
            <a href="${appUrl}${summary.link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Ver en Sinabe →
            </a>
          </div>
        `
            : ""
        }
      </div>

      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">Este es un correo automático generado por Sinabe.</p>
        <p style="margin: 5px 0 0 0;">Configurado el ${format(
          new Date(),
          "dd/MM/yyyy 'a las' HH:mm",
          { locale: es }
        )}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera el cuerpo de texto plano del email
 */
const generateTextBody = (rule, matches, summary) => {
  let text = `${rule.name}\n`;
  text += "=".repeat(50) + "\n\n";

  if (rule.description) {
    text += `${rule.description}\n\n`;
  }

  text += `Se encontraron ${matches.length} elemento(s):\n\n`;

  matches.forEach((item, index) => {
    text += `${index + 1}. `;
    if (summary.columns) {
      summary.columns.forEach((col) => {
        text += `${col.label}: ${item[col.key] || "-"} | `;
      });
    }
    text += "\n";
  });

  return text;
};
