// middleware/authorization.js
import { db } from "../lib/db.js";

const verifyRole = (roles) => {
  return async (req, res, next) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!roles.includes(user.role.name)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export default { verifyRole };
