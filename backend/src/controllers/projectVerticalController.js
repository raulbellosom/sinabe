import { db } from "../lib/db.js";

export const getVerticals = async (req, res) => {
  const verticals = await db.projectVertical.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });
  res.json(verticals);
};

export const createVertical = async (req, res) => {
  const { name } = req.body;
  const existing = await db.projectVertical.findFirst({ where: { name } });
  if (existing) {
    return res.status(400).json({ message: "Vertical ya existe" });
  }

  const vertical = await db.projectVertical.create({
    data: { name },
  });

  res.status(201).json(vertical);
};

export const deleteVertical = async (req, res) => {
  const { id } = req.params;

  const existing = await db.projectVertical.findUnique({
    where: { id: parseInt(id) },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Vertical no encontrada" });
  }

  await db.projectVertical.update({
    where: { id: parseInt(id) },
    data: { enabled: false },
  });
  res.status(204).end();
};

export const updateVertical = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const existing = await db.projectVertical.findFirst({
    where: { name, id: { not: parseInt(id) } },
  });

  if (existing) {
    return res.status(400).json({ message: "Vertical ya existe" });
  }

  const vertical = await db.projectVertical.update({
    where: { id: parseInt(id) },
    data: { name },
  });

  res.json(vertical);
};
