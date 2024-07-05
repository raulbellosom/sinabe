import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const hashedPasswordAdmin = await bcrypt.hash("adminadmin", 10);
  const hashedPasswordUser = await bcrypt.hash("useruser", 10);

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin", id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Admin",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User", id: 2 },
    update: {},
    create: {
      id: 2,
      name: "User",
    },
  });

  // Crear tipos de vehículos
  const vehicleType1 = await prisma.vehicleType.create({
    data: {
      typeName: "Sedan",
    },
  });

  const vehicleType2 = await prisma.vehicleType.create({
    data: {
      typeName: "SUV",
    },
  });

  // Crear usuarios
  const uuidUser1 = uuidv4();
  const user1 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: uuidUser1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: hashedPasswordAdmin,
      roleId: adminRole.id, // Pasar solo el ID del rol
    },
  });

  const uuidUser2 = uuidv4();
  const user2 = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      id: uuidUser2,
      firstName: "Regular",
      lastName: "User",
      email: "user@example.com",
      password: hashedPasswordUser,
      roleId: userRole.id, // Pasar solo el ID del rol
    },
  });

  // Crear vehículos
  const vehicle1 = await prisma.vehicle.create({
    data: {
      id: uuidv4(),
      typeId: vehicleType1.id, // Asignar el ID del tipo de vehículo
      brand: "Toyota",
      model: "Camry",
      acquisitionDate: new Date(),
      cost: 25000.0,
      mileage: 5000,
      status: "Active",
      createdById: user1.id, // Asignar el ID del usuario creador
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      id: uuidv4(),
      typeId: vehicleType2.id, // Asignar el ID del tipo de vehículo
      brand: "Honda",
      model: "Civic",
      acquisitionDate: new Date(),
      cost: 20000.0,
      mileage: 3000,
      status: "Active",
      createdById: user2.id, // Asignar el ID del usuario creador
    },
  });

  console.log({ user1, user2, vehicle1, vehicle2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
