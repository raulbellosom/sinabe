import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  // Verificar si ya existen roles en la base de datos
  const roles = await prisma.role.findMany();
  if (roles.length === 0) {
    const hashedPasswordAdmin = await bcrypt.hash("adminadmin", 10);
    const hashedPasswordUser = await bcrypt.hash("useruser", 10);
    const hashedPasswordguest = await bcrypt.hash("12341234", 10);

    // Crear roles
    const adminRole = await prisma.role.create({
      data: {
        id: 1,
        name: "Admin",
      },
    });

    const userRole = await prisma.role.create({
      data: {
        id: 2,
        name: "User",
      },
    });

    // Crear tipos de vehículos
    const vehicleType1 = await prisma.vehicleType.create({
      data: {
        name: "Sedan",
      },
    });

    const vehicleType2 = await prisma.vehicleType.create({
      data: {
        name: "SUV",
      },
    });

    // Crear marcas de vehículos
    const vehicleBrand1 = await prisma.vehicleBrand.create({
      data: {
        name: "Toyota",
      },
    });

    const vehicleBrand2 = await prisma.vehicleBrand.create({
      data: {
        name: "Honda",
      },
    });

    const vehicleBrand3 = await prisma.vehicleBrand.create({
      data: {
        name: "Chevrolet",
      },
    });

    // Crear modelos de vehículos
    const model1 = await prisma.model.create({
      data: {
        name: "Camry",
        year: 2021,
        typeId: vehicleType1.id,
        brandId: vehicleBrand1.id,
      },
    });

    const model2 = await prisma.model.create({
      data: {
        name: "Civic",
        year: 2021,
        typeId: vehicleType2.id,
        brandId: vehicleBrand2.id,
      },
    });

    const model3 = await prisma.model.create({
      data: {
        name: "7m3",
        year: 2021,
        typeId: vehicleType2.id,
        brandId: vehicleBrand3.id,
      },
    });

    // Crear usuarios
    const uuidUser1 = uuidv4();
    const user1 = await prisma.user.create({
      data: {
        id: uuidUser1,
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: hashedPasswordAdmin,
        roleId: adminRole.id,
      },
    });

    const uuidUser2 = uuidv4();
    const user2 = await prisma.user.create({
      data: {
        id: uuidUser2,
        firstName: "Regular",
        lastName: "User",
        email: "user@example.com",
        password: hashedPasswordUser,
        roleId: userRole.id,
      },
    });

    const uuidUser3 = uuidv4();
    const user3 = await prisma.user.create({
      data: {
        id: uuidUser3,
        firstName: "Regular",
        lastName: "User",
        email: "raul.belloso.m@gmail.com",
        password: hashedPasswordguest,
        roleId: userRole.id,
      },
    });

    // Crear vehículos con modelId
    const vehicle1 = await prisma.vehicle.create({
      data: {
        id: uuidv4(),
        modelId: model1.id,
        acquisitionDate: new Date(),
        cost: 25000.0,
        mileage: 5000,
        status: "Active",
        createdById: user1.id,
      },
      include: {
        model: true, // Incluye los datos del modelo
      },
    });

    const vehicle2 = await prisma.vehicle.create({
      data: {
        id: uuidv4(),
        modelId: model2.id,
        acquisitionDate: new Date(),
        cost: 20000.0,
        mileage: 3000,
        status: "Active",
        createdById: user2.id,
      },
      include: {
        model: true, // Incluye los datos del modelo
      },
    });

    const vehicle3 = await prisma.vehicle.create({
      data: {
        id: uuidv4(),
        modelId: model3.id,
        acquisitionDate: new Date(),
        cost: 30000.0,
        mileage: 2000,
        status: "Active",
        createdById: user3.id,
      },
      include: {
        model: true, // Incluye los datos del modelo
      },
    });

    console.log({ user1, user2, vehicle1, vehicle2 });
  } else {
    console.log("Los datos ya existen en la base de datos.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
