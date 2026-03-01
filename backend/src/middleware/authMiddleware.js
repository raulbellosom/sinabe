import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Load user with their role permissions in a single query
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // Flatten permission names for easy lookup
      user.permissions =
        user.role?.permissions?.map((rp) => rp.permission.name) ?? [];

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * Middleware factory — user must hold at least one of the listed permissions.
 * Usage: checkPermission('view_users')
 *        checkPermission('edit_roles', 'manage_permissions')  // OR logic
 */
const BYPASS_ROLES = ["Root", "Admin"];

/**
 * Middleware factory — user must hold at least one of the listed permissions.
 * Users whose role name is "Root" or "Admin" bypass ALL permission checks.
 * Usage: checkPermission('view_users')
 *        checkPermission('edit_roles', 'manage_permissions')  // OR logic
 */
const checkPermission = (...requiredPerms) => {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.permissions)) {
      return res.status(403).json({ message: "Forbidden: no permission data" });
    }

    // Root / Admin bypass all permission gates
    if (BYPASS_ROLES.includes(req.user.role?.name)) {
      return next();
    }

    const hasAny = requiredPerms.some((p) => req.user.permissions.includes(p));
    if (!hasAny) {
      return res.status(403).json({
        message: `Forbidden: requires one of [${requiredPerms.join(", ")}]`,
      });
    }

    return next();
  };
};

export { protect, checkPermission };
