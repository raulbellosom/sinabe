import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  if (roles.length === 0) {
    const conditions = await prisma.condition.createMany({
      data: [
        {
          name: "Nuevo",
          enabled: true,
        },
        {
          name: "Semi Nuevo",
          enabled: true,
        },
        {
          name: "Usado",
          enabled: true,
        },
        {
          name: "En Reparación",
          enabled: true,
        },
        {
          name: "En Mantenimiento",
          enabled: true,
        },
        {
          name: "En Uso",
          enabled: true,
        },
        {
          name: "En Desuso",
          enabled: true,
        },
        {
          name: "En Venta",
          enabled: true,
        },
        {
          name: "Vendido",
          enabled: true,
        },
        {
          name: "En renta",
          enabled: true,
        },
        {
          name: "Rentado",
          enabled: true,
        },
        {
          name: "Prestado",
          enabled: true,
        },
        {
          name: "En Préstamo",
          enabled: true,
        },
        {
          name: "Descompuesto",
          enabled: true,
        },
      ],
    });

    const rootRole = await prisma.role.create({
      data: {
        name: "Root",
      },
    });

    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
      },
    });

    const userRole = await prisma.role.create({
      data: {
        name: "User",
      },
    });

    const guestRole = await prisma.role.create({
      data: {
        name: "Guest",
      },
    });

    const permissions = [
      { name: "view_dashboard", description: "Ver el panel de control" },
      { name: "view_account", description: "Ver la cuenta" },
      { name: "edit_account", description: "Editar información de la cuenta" },
      { name: "change_password", description: "Cambiar contraseña" },
      { name: "change_account_image", description: "Cambiar imagen de perfil" },
      { name: "view_users", description: "Ver usuarios" },
      { name: "create_users", description: "Crear usuarios" },
      { name: "edit_users", description: "Editar usuarios" },
      { name: "delete_users", description: "Eliminar usuarios" },
      { name: "view_roles", description: "Ver roles" },
      { name: "create_roles", description: "Crear roles" },
      { name: "edit_roles", description: "Editar roles" },
      { name: "delete_roles", description: "Eliminar roles" },
      { name: "view_vehicles", description: "Ver vehículos" },
      { name: "create_vehicles", description: "Crear vehículos" },
      { name: "edit_vehicles", description: "Editar vehículos" },
      { name: "delete_vehicles", description: "Eliminar vehículos" },
      {
        name: "view_vehicles_conditions",
        description: "Ver condiciones de vehículos",
      },
      {
        name: "create_vehicles_conditions",
        description: "Crear condiciones de vehículos",
      },
      {
        name: "edit_vehicles_conditions",
        description: "Editar condiciones de vehículos",
      },
      {
        name: "delete_vehicles_conditions",
        description: "Eliminar condiciones de vehículos",
      },
      { name: "view_vehicles_brands", description: "Ver marcas de vehículos" },
      {
        name: "create_vehicles_brands",
        description: "Crear marcas de vehículos",
      },
      {
        name: "edit_vehicles_brands",
        description: "Editar marcas de vehículos",
      },
      {
        name: "delete_vehicles_brands",
        description: "Eliminar marcas de vehículos",
      },
      { name: "view_vehicles_types", description: "Ver tipos de vehículos" },
      {
        name: "create_vehicles_types",
        description: "Crear tipos de vehículos",
      },
      { name: "edit_vehicles_types", description: "Editar tipos de vehículos" },
      {
        name: "delete_vehicles_types",
        description: "Eliminar tipos de vehículos",
      },
      { name: "view_vehicles_models", description: "Ver modelos de vehículos" },
      {
        name: "create_vehicles_models",
        description: "Crear modelos de vehículos",
      },
      {
        name: "edit_vehicles_models",
        description: "Editar modelos de vehículos",
      },
      {
        name: "delete_vehicles_models",
        description: "Eliminar modelos de vehículos",
      },
    ];

    const createdPermissions = await Promise.all(
      permissions.map((perm) =>
        prisma.permission.create({
          data: perm,
        })
      )
    );

    await Promise.all(
      createdPermissions.map((perm) =>
        prisma.rolePermission.create({
          data: {
            roleId: rootRole.id,
            permissionId: perm.id,
          },
        })
      )
    );

    await Promise.all(
      createdPermissions.map((perm) =>
        prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        })
      )
    );

    const hashedPasswordAdmin = await bcrypt.hash("adminadmin", 10);
    const hashedPasswordUser = await bcrypt.hash("useruser", 10);

    const uuidUser1 = uuidv4();
    const user1 = await prisma.user.create({
      data: {
        id: uuidUser1,
        firstName: "User",
        lastName: "Root",
        email: "root@sinabe.com",
        password: hashedPasswordAdmin,
        roleId: rootRole.id,
        enabled: true,
      },
    });

    console.log({ user1 });
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
