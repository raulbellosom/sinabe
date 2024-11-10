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
      { name: "view_inventories", description: "Ver inventarios" },
      { name: "create_inventories", description: "Crear inventarios" },
      { name: "edit_inventories", description: "Editar inventarios" },
      { name: "delete_inventories", description: "Eliminar inventarios" },
      {
        name: "view_inventories_conditions",
        description: "Ver condiciones de inventarios",
      },
      {
        name: "create_inventories_conditions",
        description: "Crear condiciones de inventarios",
      },
      {
        name: "edit_inventories_conditions",
        description: "Editar condiciones de inventarios",
      },
      {
        name: "delete_inventories_conditions",
        description: "Eliminar condiciones de inventarios",
      },
      {
        name: "view_inventories_brands",
        description: "Ver marcas de inventarios",
      },
      {
        name: "create_inventories_brands",
        description: "Crear marcas de inventarios",
      },
      {
        name: "edit_inventories_brands",
        description: "Editar marcas de inventarios",
      },
      {
        name: "delete_inventories_brands",
        description: "Eliminar marcas de inventarios",
      },
      {
        name: "view_inventories_types",
        description: "Ver tipos de inventarios",
      },
      {
        name: "create_inventories_types",
        description: "Crear tipos de inventarios",
      },
      {
        name: "edit_inventories_types",
        description: "Editar tipos de inventarios",
      },
      {
        name: "delete_inventories_types",
        description: "Eliminar tipos de inventarios",
      },
      {
        name: "view_inventories_models",
        description: "Ver modelos de inventarios",
      },
      {
        name: "create_inventories_models",
        description: "Crear modelos de inventarios",
      },
      {
        name: "edit_inventories_models",
        description: "Editar modelos de inventarios",
      },
      {
        name: "delete_inventories_models",
        description: "Eliminar modelos de inventarios",
      },
      {
        name: "view_inventories_custom_fields",
        description: "Ver campos personalizados de inventarios",
      },
      {
        name: "create_inventories_custom_fields",
        description: "Crear campos personalizados de inventarios",
      },
      {
        name: "edit_inventories_custom_fields",
        description: "Editar campos personalizados de inventarios",
      },
      {
        name: "delete_inventories_custom_fields",
        description: "Eliminar campos personalizados de inventarios",
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
