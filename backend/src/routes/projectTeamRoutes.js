import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProjectTeam,
  addUserToProject,
  removeUserFromProject,
  searchAvailableUsers,
  updateProjectMember,
} from "../controllers/projectTeamController.js";

const router = express.Router();

// 🔄 Obtener todos los miembros del proyecto
router.get("/projects/:projectId/team", protect, getProjectTeam);

// ➕ Agregar usuario al proyecto
router.post("/projects/:projectId/team", protect, addUserToProject);

// ✏️ Actualizar rol de un miembro
router.put("/projects/:projectId/team/:memberId", protect, updateProjectMember);

// ❌ Eliminar usuario del proyecto
router.delete(
  "/projects/:projectId/team/:memberId",
  protect,
  removeUserFromProject
);

// 🔍 Buscar usuarios disponibles para asignar
router.get("/users/search", protect, searchAvailableUsers);

export default router;
