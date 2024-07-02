// middleware/authorization.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const verifyRole = (roles) => {
  return async (req, res, next) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user

    const user = await prisma.user.findUnique({
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

// role permissions example
// const express = require('express');
// const { verifyRole } = require('./middleware/authorization');
// const app = express();

// app.use(express.json());

// // Ejemplo de ruta protegida
// app.get('/vehicles', verifyRole(['admin', 'user']), async (req, res) => {
//   const vehicles = await prisma.vehicle.findMany();
//   res.json(vehicles);
// });

// // Otra ruta protegida para solo admin
// app.delete('/vehicles/:id', verifyRole(['admin']), async (req, res) => {
//   const { id } = req.params;
//   await prisma.vehicle.delete({
//     where: { id: parseInt(id) },
//   });
//   res.status(204).send();
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
