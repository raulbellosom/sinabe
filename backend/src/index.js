import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
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
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();

const app = express();
const APP_URL = process.env.APP_URL || "http://localhost:5173";

console.log("APP_URL", APP_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors([APP_URL]));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventories", inventoryRoutes);
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
app.use("/api/ping", pingRoutes);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
