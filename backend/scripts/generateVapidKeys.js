/**
 * Script para generar claves VAPID para Web Push
 * Ejecutar con: node scripts/generateVapidKeys.js
 */
import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n========================================");
console.log("    CLAVES VAPID GENERADAS");
console.log("========================================\n");

console.log("Añade estas líneas a tu archivo .env:\n");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@sinabe.com`);

console.log("\n========================================");
console.log("    IMPORTANTE");
console.log("========================================");
console.log("1. Guarda la clave privada de forma segura");
console.log("2. No compartas la clave privada");
console.log("3. Si regeneras las claves, los usuarios");
console.log("   deberán suscribirse de nuevo");
console.log("========================================\n");
