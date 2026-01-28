import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import inventoryLocationRoutes from "./routes/inventoryLocationRoutes.js";
import pingRoutes from "./routes/pingRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import rolePermissionRoutes from "./routes/rolePermissionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import deadlineRoutes from "./routes/deadlineRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import projectDocumentRoutes from "./routes/projectDocumentRoutes.js";
import projectTeamRoutes from "./routes/projectTeamRoutes.js";
import inventoryAssignmentRoutes from "./routes/inventoryAssignmentRoute.js";
import verticalRoutes from "./routes/verticalRoutes.js";
import invoiceRoutes, { purchaseOrderRouter } from "./routes/invoiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import custodyRoutes from "./routes/custodyRoutes.js";
import userPreferenceRoutes from "./routes/userPreferenceRoutes.js";
import notificationRuleRoutes from "./routes/notificationRuleRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import pushRoutes from "./routes/pushRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import { startScheduler } from "./notifications/scheduler.js";

dotenv.config();

const app = express();
const APP_URL = process.env.APP_URL || "http://localhost:5173";

console.log("APP_URL", APP_URL);
// app.use((req, res, next) => {
//   console.log("CORS Origin recibido:", req.headers.origin);
//   next();
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  process.env.APP_URL || "http://localhost:5173",
  "capacitor://localhost",
  "http://localhost",
  "https://localhost", // para APK en algunos dispositivos
  undefined, // algunas peticiones nativas no envían origin
];

// app.use(cors([APP_URL]));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Routes registration
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/inventory-locations", inventoryLocationRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/project-documents", projectDocumentRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/project-team", projectTeamRoutes);
app.use("/api/inventory-assignments", inventoryAssignmentRoutes);
app.use("/api/verticals", verticalRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ping", pingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/custody-records", custodyRoutes);
app.use("/api/preferences", userPreferenceRoutes);
app.use("/api/notification-rules", notificationRuleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Iniciar el scheduler de notificaciones
  startScheduler();
});
