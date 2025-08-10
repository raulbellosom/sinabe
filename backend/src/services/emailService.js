import { exec } from "child_process";
import { promisify } from "util";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

// Configuración de correo
const EMAIL_CONFIG = {
  from: "sistemasgappvr@gmail.com",
  defaultRecipients: [
    "sistemaspvr@aeropuertosgap.com.mx",
    "sistemasgappvr@gmail.com",
  ],
  sinabeUrl: "https://sinabe.giize.com",
  logFile: "/var/log/sinabe_notifications.log",
};

// 📧 Enviar correo usando msmtp
export const sendEmailWithMsmtp = async (to, subject, htmlContent) => {
  try {
    const recipients = Array.isArray(to) ? to.join(",") : to;

    const emailContent = `Subject: ${subject}
To: ${recipients}
Content-Type: text/html; charset=UTF-8

${htmlContent}`;

    // Crear archivo temporal para el correo
    const tempFile = `/tmp/sinabe_email_${Date.now()}.txt`;
    await fs.promises.writeFile(tempFile, emailContent, "utf8");

    // Enviar correo usando msmtp
    const command = `msmtp ${recipients} < ${tempFile}`;
    await execAsync(command);

    // Limpiar archivo temporal
    await fs.promises.unlink(tempFile);

    // Log
    await logEmail(
      `Correo enviado exitosamente a: ${recipients} - Asunto: ${subject}`
    );

    return { success: true, recipients };
  } catch (error) {
    await logEmail(`Error enviando correo: ${error.message}`);
    throw new Error(`Error enviando correo: ${error.message}`);
  }
};

// 📧 Enviar notificación de inventarios nuevos sin asignar
export const sendNewInventoriesNotification = async (inventories) => {
  const subject = "Recepción de equipo nuevo sin asignar | SINABE";
  const fecha = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });

  let tableRows = "";
  for (const inventory of inventories) {
    const tipo = inventory.model?.type?.name || "Sin tipo";
    const modelo = inventory.model?.name || "Sin modelo";
    const marca = inventory.model?.brand?.name || "Sin marca";
    const serie = inventory.serialNumber || "Sin serie";
    const fechaRecepcion = inventory.receptionDate
      ? format(new Date(inventory.receptionDate), "dd/MM/yyyy")
      : "Sin fecha";
    const fechaRegistro = inventory.createdAt
      ? format(new Date(inventory.createdAt), "dd/MM/yyyy")
      : "Sin fecha";

    tableRows += `
      <tr>
        <td>${tipo}</td>
        <td>${modelo}</td>
        <td>${serie}</td>
        <td>${marca}</td>
        <td>${fechaRecepcion}</td>
        <td>${fechaRegistro}</td>
        <td>
          <a href="${EMAIL_CONFIG.sinabeUrl}/inventories/view/${inventory.id}" 
             target="_blank" 
             style="text-decoration: none; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #f8f8f8; font-family: Arial, sans-serif;">
            👁️ Ver
          </a>
        </td>
      </tr>`;
  }

  const htmlContent = `
    <html>
      <body>
        <p>Hola equipo TI!</p>
        <p>Hago de tu conocimiento que se han identificado los siguientes equipos <strong>nuevos sin asignar</strong> desde hace más de 2 meses:</p>
        
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; margin: 20px 0;">
          <tr style="background-color: #f2f2f2;">
            <th>Tipo</th>
            <th>Modelo</th>
            <th>Serie</th>
            <th>Marca</th>
            <th>Fecha de Recepción</th>
            <th>Fecha de Registro</th>
            <th>Link SINABE</th>
          </tr>
          ${tableRows}
        </table>
        
        <p style="color: #666; font-size: 12px;">
          <strong>Recomendación:</strong> Considere asignar estos equipos a proyectos activos o evaluar su estado.
        </p>
        
        <p>Saludos.</p>
        <p><em>Sistema SINABE - ${fecha}</em></p>
      </body>
    </html>`;

  return await sendEmailWithMsmtp(
    EMAIL_CONFIG.defaultRecipients,
    subject,
    htmlContent
  );
};

// 📧 Enviar notificación de inventarios sin uso prolongado
export const sendUnusedInventoriesNotification = async (inventories) => {
  const subject = "Inventarios sin uso prolongado | SINABE";
  const fecha = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });

  let tableRows = "";
  for (const inventory of inventories) {
    const tipo = inventory.model?.type?.name || "Sin tipo";
    const modelo = inventory.model?.name || "Sin modelo";
    const marca = inventory.model?.brand?.name || "Sin marca";
    const serie = inventory.serialNumber || "Sin serie";
    const fechaRecepcion = inventory.receptionDate
      ? format(new Date(inventory.receptionDate), "dd/MM/yyyy")
      : "Sin fecha";
    const condiciones =
      inventory.conditions?.map((c) => c.condition.name).join(", ") ||
      "Sin condiciones";

    tableRows += `
      <tr>
        <td>${tipo}</td>
        <td>${modelo}</td>
        <td>${serie}</td>
        <td>${marca}</td>
        <td>${fechaRecepcion}</td>
        <td>${condiciones}</td>
        <td>
          <a href="${EMAIL_CONFIG.sinabeUrl}/inventories/view/${inventory.id}" 
             target="_blank" 
             style="text-decoration: none; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #f8f8f8; font-family: Arial, sans-serif;">
            👁️ Ver
          </a>
        </td>
      </tr>`;
  }

  const htmlContent = `
    <html>
      <body>
        <p>Hola equipo de gestión de inventarios!</p>
        <p>Se han identificado <strong>${inventories.length} inventarios sin uso</strong> desde hace más de 6 meses:</p>
        
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; margin: 20px 0;">
          <tr style="background-color: #f2f2f2;">
            <th>Tipo</th>
            <th>Modelo</th>
            <th>Serie</th>
            <th>Marca</th>
            <th>Fecha de Recepción</th>
            <th>Condiciones</th>
            <th>Link SINABE</th>
          </tr>
          ${tableRows}
        </table>
        
        <p style="color: #666; font-size: 12px;">
          <strong>Recomendación:</strong> Revise el estado de estos equipos y considere reasignarlos o evaluar su baja.
        </p>
        
        <p>Saludos.</p>
        <p><em>Sistema SINABE - ${fecha}</em></p>
      </body>
    </html>`;

  return await sendEmailWithMsmtp(
    EMAIL_CONFIG.defaultRecipients,
    subject,
    htmlContent
  );
};

// 📧 Enviar notificación de inventarios en deadline sin uso
export const sendDeadlineUnusedNotification = async (
  inventories,
  projectUsers
) => {
  const subject = "Inventarios asignados sin uso | SINABE";
  const fecha = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });

  // Agrupar por proyecto
  const projectGroups = {};
  for (const inventory of inventories) {
    for (const invDeadline of inventory.InventoryDeadline) {
      const projectId = invDeadline.deadline.project.id;
      const projectName = invDeadline.deadline.project.name;

      if (!projectGroups[projectId]) {
        projectGroups[projectId] = {
          name: projectName,
          inventories: [],
        };
      }

      projectGroups[projectId].inventories.push({
        ...inventory,
        deadlineName: invDeadline.deadline.name,
      });
    }
  }

  let projectSections = "";
  for (const [projectId, group] of Object.entries(projectGroups)) {
    let tableRows = "";
    for (const inventory of group.inventories) {
      const tipo = inventory.model?.type?.name || "Sin tipo";
      const modelo = inventory.model?.name || "Sin modelo";
      const marca = inventory.model?.brand?.name || "Sin marca";
      const serie = inventory.serialNumber || "Sin serie";

      tableRows += `
        <tr>
          <td>${tipo}</td>
          <td>${modelo}</td>
          <td>${serie}</td>
          <td>${marca}</td>
          <td>${inventory.deadlineName}</td>
          <td>
            <a href="${EMAIL_CONFIG.sinabeUrl}/inventories/view/${inventory.id}" 
               target="_blank" 
               style="text-decoration: none; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #f8f8f8; font-family: Arial, sans-serif;">
              👁️ Ver
            </a>
          </td>
        </tr>`;
    }

    projectSections += `
      <h3 style="color: #333; margin-top: 30px;">Proyecto: ${group.name}</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; margin: 10px 0;">
        <tr style="background-color: #f2f2f2;">
          <th>Tipo</th>
          <th>Modelo</th>
          <th>Serie</th>
          <th>Marca</th>
          <th>Deadline</th>
          <th>Link SINABE</th>
        </tr>
        ${tableRows}
      </table>`;
  }

  const htmlContent = `
    <html>
      <body>
        <p>Hola!</p>
        <p>Se han identificado <strong>inventarios asignados a deadlines</strong> que no han sido marcados como "En uso" después de 7 días:</p>
        
        ${projectSections}
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          <strong>Recomendación:</strong> Verifique si estos equipos están siendo utilizados y actualice su estado en el sistema.
        </p>
        
        <p>Saludos.</p>
        <p><em>Sistema SINABE - ${fecha}</em></p>
      </body>
    </html>`;

  // Obtener emails únicos de usuarios de los proyectos afectados
  const emails = new Set();
  for (const inventory of inventories) {
    for (const invDeadline of inventory.InventoryDeadline) {
      for (const user of invDeadline.deadline.users) {
        if (user.enabled && user.email) {
          emails.add(user.email);
        }
      }
    }
  }

  return await sendEmailWithMsmtp(Array.from(emails), subject, htmlContent);
};

// 📧 Función principal para enviar correos diarios (equivalente al script bash)
export const sendDailyInventoryReport = async (testMode = false) => {
  try {
    const { db } = await import("../lib/db.js");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fechaUso = format(yesterday, "yyyy-MM-dd");
    const encabezadoFecha = testMode
      ? `hoy (${fechaUso})`
      : `ayer (${fechaUso})`;

    // Query similar al script bash: inventarios CREADOS AYER con receptionDate
    const newInventories = await db.inventory.findMany({
      where: {
        enabled: true,
        createdAt: {
          gte: new Date(fechaUso + "T00:00:00.000Z"),
          lt: new Date(fechaUso + "T23:59:59.999Z"),
        },
        receptionDate: {
          not: null,
        },
      },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });

    if (newInventories.length > 0) {
      const subject = "Recepción de equipo nuevo | SINABE";

      let tableRows = "";
      for (const inventory of newInventories) {
        const tipo = inventory.model?.type?.name || "Sin tipo";
        const modelo = inventory.model?.name || "Sin modelo";
        const marca = inventory.model?.brand?.name || "Sin marca";
        const serie = inventory.serialNumber || "Sin serie";
        const fechaRecepcion = inventory.receptionDate
          ? format(new Date(inventory.receptionDate), "yyyy-MM-dd")
          : "Sin fecha";
        const fechaRegistro = format(
          new Date(inventory.createdAt),
          "yyyy-MM-dd"
        );

        tableRows += `
          <tr>
            <td>${tipo}</td>
            <td>${modelo}</td>
            <td>${serie}</td>
            <td>${marca}</td>
            <td>${fechaRecepcion}</td>
            <td>${fechaRegistro}</td>
            <td>
              <a href="${EMAIL_CONFIG.sinabeUrl}/inventories/view/${inventory.id}" 
                 target="_blank" 
                 style="text-decoration: none; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #f8f8f8; font-family: Arial, sans-serif;">
                👁️ Ver
              </a>
            </td>
          </tr>`;
      }

      const htmlContent = `
        <html>
          <body>
            <p>Hola equipo TI!, hago de tu conocimiento que ${encabezadoFecha} se recibieron los siguientes equipos:</p>
            
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
              <tr style="background-color: #f2f2f2;">
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Serie</th>
                <th>Marca</th>
                <th>Fecha de Recepción</th>
                <th>Fecha de Registro</th>
                <th>Link SINABE</th>
              </tr>
              ${tableRows}
            </table>
            
            <p>Saludos.</p>
          </body>
        </html>`;

      await sendEmailWithMsmtp(
        EMAIL_CONFIG.defaultRecipients,
        subject,
        htmlContent
      );
      await logEmail(
        `Correo enviado con ${newInventories.length} registros para la fecha ${fechaUso}`
      );
    } else {
      await logEmail(
        `Sin registros encontrados para la fecha ${fechaUso} → No se envió correo`
      );
    }

    return {
      date: fechaUso,
      inventoriesFound: newInventories.length,
      emailSent: newInventories.length > 0,
    };
  } catch (error) {
    await logEmail(`Error en reporte diario: ${error.message}`);
    throw error;
  }
};

// 📝 Función para logging
const logEmail = async (message) => {
  try {
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const logMessage = `[${timestamp}] ${message}\n`;

    await fs.promises.appendFile(EMAIL_CONFIG.logFile, logMessage, "utf8");
  } catch (error) {
    console.error("Error escribiendo log:", error);
  }
};

export default {
  sendEmailWithMsmtp,
  sendNewInventoriesNotification,
  sendUnusedInventoriesNotification,
  sendDeadlineUnusedNotification,
  sendDailyInventoryReport,
  EMAIL_CONFIG,
};
