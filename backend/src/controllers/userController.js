import { db } from "../lib/db.js";
import bcrypt from "bcryptjs";

const parseStatus = (status) => {
  if (status === "true" || status === true) {
    return true;
  } else if (status === "false" || status === false) {
    return false;
  } else {
    return status;
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await db.user.findMany();
    res.json(users);
  } catch (error) {
    console.log("error on getUsers", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.user.findUnique({
      where: { id, enabled: true },
      include: {
        role: true,
        photo: {
          where: { enabled: true },
        },
      },
    });

    if (user) {
      user.password = undefined;
      res.json(user);
    } else {
      res.status(404).json({ message: "Usuario no encontrado." });
    }
  } catch (error) {
    console.log("error on getUserById", error);
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { userData } = req.body;
    const { profileImage } = req;

    const { firstName, lastName, email, password, phone, role, userName } =
      JSON.parse(userData);

    const userExists = await db.user.findFirst({
      where: { email, enabled: true },
    });

    if (userExists) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        userName,
        password: hashedPassword,
        roleId: parseInt(role),
        enabled: true,
        status: true,
      },
    });

    if (profileImage) {
      await db.userImage.create({
        data: {
          url: profileImage.url,
          thumbnail: profileImage.thumbnail,
          type: profileImage.type,
          metadata: profileImage.metadata,
          enabled: true,
          userId: createdUser.id,
        },
      });
    }

    const newUser = await db.user.findUnique({
      where: { id: createdUser.id },
      include: {
        role: true,
        photo: {
          where: { enabled: true },
        },
      },
    });

    newUser.password = undefined;

    res.status(201).json(newUser);
  } catch (error) {
    console.log("error on createUser", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userData } = req.body;
    const { profileImage } = req;

    const { id, firstName, lastName, email, phone, role, status, userName } =
      JSON.parse(userData);

    const userExists = await db.user.findFirst({ where: { id } });

    if (!userExists) {
      return res.status(400).json({ message: "El usuario no existe." });
    }

    const emailExists = await db.user.findFirst({
      where: { email, NOT: { id }, enabled: true },
    });

    if (emailExists) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        userName,
        status: parseStatus(status),
        roleId: parseInt(role),
      },
      include: {
        role: true,
        photo: {
          where: { enabled: true },
        },
      },
    });

    if (profileImage) {
      await db.userImage.updateMany({
        where: { userId: id, enabled: true },
        data: { enabled: false },
      });

      await db.userImage.create({
        data: {
          url: profileImage.url,
          thumbnail: profileImage.thumbnail,
          type: profileImage.type,
          metadata: profileImage.metadata,
          enabled: true,
          userId: updatedUser.id,
        },
      });
    }

    const newUser = await db.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        role: true,
        photo: {
          where: { enabled: true },
        },
      },
    });

    newUser.password = undefined;

    return res.json(newUser);
  } catch (error) {
    console.log("error on updateUser", error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userExists = await db.user.findFirst({ where: { id } });

    if (!userExists) {
      return res.status(400).json({ message: "El usuario no existe." });
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    const email = user.email;
    const emailParts = email.split("@");
    const newEmail = `rm_${emailParts[0]}@${emailParts[1]}`;

    await db.user.update({
      where: { id },
      data: { enabled: false, email: newEmail },
    });

    res.json({ message: "Usuario eliminado." });
  } catch (error) {
    console.log("error on deleteUser", error);
    return res.status(500).json({ message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Contraseña actualizada." });
  } catch (error) {
    console.log("error on changeUserPassword", error);
    return res.status(500).json({ message: error.message });
  }
};

// export const searchUsers = async (req, res) => {
//   try {
//     const {
//       searchTerm,
//       sortBy,
//       order = "asc",
//       page = 1,
//       pageSize = 10,
//     } = req.query;

//     const validSortColumns = [
//       "firstName",
//       "lastName",
//       "email",
//       "phone",
//       "role",
//       "status",
//       "userName",
//     ];
//     const textSearchConditions = searchTerm
//       ? {
//           OR: [
//             { firstName: { contains: searchTerm } },
//             { lastName: { contains: searchTerm } },
//             { email: { contains: searchTerm } },
//             { phone: { contains: searchTerm } },
//             { role: { name: { contains: searchTerm } } },
//             { status: { contains: searchTerm } },
//             { userName: { contains: searchTerm } },
//           ],
//         }
//       : {};

//     const formSortBy = (value, order) => {
//       let arr = value.split(".");
//       let obj = {};
//       if (arr.length === 3) {
//         obj = {
//           [arr[0]]: {
//             [arr[1]]: {
//               [arr[2]]: order,
//             },
//           },
//         };
//       } else if (arr.length === 2) {
//         obj = {
//           [arr[0]]: {
//             [arr[1]]: order,
//           },
//         };
//       } else {
//         obj = {
//           [arr[0]]: order,
//         };
//       }
//       return obj;
//     };

//     const orderField = validSortColumns.includes(sortBy) ? sortBy : "firstName";
//     const orderDirection = order === "asc" ? "asc" : "desc";
//     const skip = (page - 1) * pageSize;
//     const take = parseInt(pageSize);

//     const whereConditions = {
//       ...textSearchConditions,
//       enabled: true,
//       role: { name: { not: "Root" } },
//     };

//     const users = await db.user.findMany({
//       where: whereConditions,
//       include: {
//         role: true,
//         photo: {
//           where: { enabled: true },
//         },
//       },
//       orderBy: formSortBy(orderField, orderDirection),
//       skip,
//       take,
//     });

//     const usersWithoutPassword = users?.map((user) => {
//       const { password, ...userWithoutPassword } = user;
//       return userWithoutPassword;
//     });

//     const totalRecords = await db.user.count({
//       where: whereConditions,
//     });

//     const totalPages = Math.ceil(totalRecords / pageSize);

//     return res.json({
//       data: usersWithoutPassword,
//       pagination: {
//         totalRecords,
//         totalPages,
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//       },
//     });
//   } catch (error) {
//     console.log("error on searchUsers", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

export const searchUsers = async (req, res) => {
  try {
    const {
      searchTerm,
      sortBy,
      order = "asc",
      page = 1,
      pageSize = 10,
      status,
      roles,
    } = req.query;

    const parsedPageSize = pageSize == "0" ? null : parseInt(pageSize, 10);

    // 2. Usar una función de ordenamiento más robusta y dinámica
    const buildOrderBy = (sortByField, sortOrder) => {
      if (sortByField === "role") {
        return { role: { name: sortOrder } }; // Prisma espera esto
      }

      const parts = sortByField.split(".");
      if (parts.length === 1) return { [sortByField]: sortOrder }; // campos directos

      let current = {};
      let nested = current;
      for (let i = 0; i < parts.length - 1; i++) {
        nested[parts[i]] = {};
        nested = nested[parts[i]];
      }
      nested[parts[parts.length - 1]] = sortOrder;
      return current;
    };

    // 3. Construcción dinámica de las condiciones 'where'
    const whereConditions = {
      enabled: true,
      // Siempre excluimos al rol "Root" de los resultados
      role: {
        name: {
          not: "Root",
        },
      },
    };

    // Añadir filtro de 'status' si existe
    if (status && status.length > 0) {
      whereConditions.status = {
        in: Array.isArray(status) ? status : [status],
      };
    }

    // Añadir filtro de 'roles' si existe, fusionándolo con la condición 'not: "Root"'
    if (roles && roles.length > 0) {
      whereConditions.role.name.in = Array.isArray(roles) ? roles : [roles];
    }

    // Añadir condiciones de búsqueda de texto si existe 'searchTerm'
    if (searchTerm) {
      whereConditions.OR = [
        { firstName: { contains: searchTerm } },
        { lastName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
        { userName: { contains: searchTerm } },
        { role: { name: { contains: searchTerm } } },
      ];
    }

    const validSortBy = sortBy || "firstName";
    const orderBy = buildOrderBy(validSortBy, order);

    const skip = parsedPageSize ? (page - 1) * parsedPageSize : undefined;
    const take = parsedPageSize ?? undefined;

    const users = await db.user.findMany({
      where: whereConditions,
      include: {
        role: true,
        photo: { where: { enabled: true } },
      },
      orderBy,
      skip,
      take,
    });

    // El mapeo para quitar el password es correcto, lo mantenemos
    const usersWithoutPassword = users?.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const totalRecords = await db.user.count({ where: whereConditions });
    const totalPages = parsedPageSize
      ? Math.ceil(totalRecords / parsedPageSize)
      : 1;

    return res.json({
      data: usersWithoutPassword,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parsedPageSize ?? "ALL",
      },
    });
  } catch (error) {
    console.error("Error en searchUsers:", error);
    return res.status(500).json({ message: error.message });
  }
};
