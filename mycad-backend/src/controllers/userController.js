import { db } from "../lib/db.js";

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
    const { profileImage, userData } = req;

    const { firstName, lastName, email, password, roleId } =
      JSON.parse(userData);

    const createdUser = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        roleId,
        enabled: true,
        status: true,
      },
    });

    if (profileImage) {
      await db.userImage.create({
        data: {
          url: profileImage.url,
          thumbnail: profileImage.thumbnailUrl,
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
    const { profileImage, userData } = req;
    const { id, firstName, lastName, email, roleId } = JSON.parse(userData);

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        roleId,
      },
    });

    if (profileImage) {
      await db.userImage.create({
        data: {
          url: profileImage.url,
          thumbnail: profileImage.thumbnailUrl,
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

    res.json(newUser);
  } catch (error) {
    console.log("error on updateUser", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.user.update({
      where: { id },
      data: { enabled: false },
    });

    res.json({ message: "Usuario eliminado." });
  } catch (error) {
    console.log("error on deleteUser", error);
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const {
      searchTerm,
      sortBy,
      order = "asc",
      page = 1,
      pageSize = 10,
    } = req.query;
    const { user: currentUser } = req;
    const validSortColumns = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "role",
    ];
    const textSearchConditions = searchTerm
      ? {
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
            { role: { name: { contains: searchTerm } } },
          ],
        }
      : {};

    const formSortBy = (value, order) => {
      let arr = value.split(".");
      let obj = {};
      if (arr.length === 3) {
        obj = {
          [arr[0]]: {
            [arr[1]]: {
              [arr[2]]: order,
            },
          },
        };
      } else if (arr.length === 2) {
        obj = {
          [arr[0]]: {
            [arr[1]]: order,
          },
        };
      } else {
        obj = {
          [arr[0]]: order,
        };
      }
      return obj;
    };

    const orderField = validSortColumns.includes(sortBy) ? sortBy : "firstName";
    const orderDirection = order === "asc" ? "asc" : "desc";
    const skip = (page - 1) * pageSize;
    const take = parseInt(pageSize);

    const whereConditions = {
      ...textSearchConditions,
      enabled: true,
      // id is different from the user id
      id: { not: currentUser.id },
    };

    const users = await db.user.findMany({
      where: whereConditions,
      include: {
        role: true,
        photo: {
          where: { enabled: true },
        },
      },
      orderBy: formSortBy(orderField, orderDirection),
      skip,
      take,
    });

    const usersWithoutPassword = users?.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const totalRecords = await db.user.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    res.json({
      data: usersWithoutPassword,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.log("error on searchUsers", error);
    res.status(500).json({ message: error.message });
  }
};
