import bcrypt from "bcryptjs";
import { db } from "../lib/db.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { firstName, lastName, email, password, roleId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        roleId,
      },
    });

    res.status(201).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: user.roleId,
      },
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        user,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loadUser = async (req, res) => {
  const { user } = req;

  try {
    if (user) {
      const loadedUser = await db.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      res.json(loadedUser);
    } else {
      res.status(401).json({ message: "Not authorized, token failed 3" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logged out" });
};

export const updateProfile = async (req, res) => {
  const { user } = req;
  const { firstName, lastName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfileImage = async (req, res) => {
  const { user } = req;
  const { profileImage } = req.body;

  try {
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        profileImage,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { user } = req;
  const { password } = req.body;

  try {
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res
        .status(400)
        .json({ message: "Password is the same as current password" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
