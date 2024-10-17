// middleware/authorization.js
import { db } from "../lib/db.js";
import { rolesSchema } from "../utils/rolesSchema.js"; // Asegúrate de importar tu rolesSchema

export const verifyRole = (entity, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Busca al usuario y su rol
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const roleName = user.role.name;

      // Verifica si el rol tiene permiso para realizar la acción sobre la entidad
      const permissions = rolesSchema[roleName]?.[entity];

      if (!permissions || !permissions.includes(action)) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient permissions" });
      }

      next(); // Si todo está bien, pasa al siguiente middleware o controlador
    } catch (error) {
      console.log("error on verifyRole", error);
      res.status(500).json({ message: error.message });
    }
  };
};
