import { db } from "../lib/db.js";

// 👥 Obtener todos los miembros del proyecto
export const getProjectTeam = async (req, res) => {
  const { projectId } = req.params;

  try {
    const members = await db.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userName: true,
            phone: true,
            status: true,
            enabled: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
            photo: {
              where: { enabled: true },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = members.map((member) => ({
      id: member.user.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      email: member.user.email,
      role: member.role, // Rol dentro del proyecto
      globalRole: member.user.role.name, // Rol general del sistema
      userName: member.user.userName,
      phone: member.user.phone,
      status: member.user.status,
      enabled: member.user.enabled,
      thumbnail: member.user.photo?.[0]?.thumbnail || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching project team:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Buscar usuarios activos por nombre o email, excluyendo los ya asignados y los de tipo root
export const searchAvailableUsers = async (req, res) => {
  const { q = "", projectId } = req.query;

  try {
    // 1. Obtener miembros ya asignados
    const existingMembers = await db.projectMember.findMany({
      where: { projectId },
    });
    const assignedUserIds = existingMembers.map((m) => m.userId);

    // 2. Buscar usuarios activos que no estén asignados y que no sean root
    const users = await db.user.findMany({
      where: {
        enabled: true,
        id: { notIn: assignedUserIds },
        role: {
          name: {
            not: "root",
          },
        },
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
        ],
      },
      include: {
        photo: {
          where: { enabled: true },
          take: 1,
        },
        role: true,
      },
      take: 10,
      orderBy: { firstName: "asc" },
    });

    // 3. Transformar resultados
    const results = users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      photo: u.photo?.[0]?.thumbnail || null,
    }));

    res.json(results);
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ➕ Agregar miembro al proyecto (a partir de usuario real)
export const addUserToProject = async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  try {
    const user = await db.user.findUnique({
      where: { id: userId, enabled: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado o deshabilitado" });
    }

    const created = await db.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role,
      },
      include: {
        user: {
          include: {
            photo: {
              where: { enabled: true },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    res.status(201).json({
      id: created.user.id,
      name: created.name,
      email: created.user.email,
      role: created.role,
      thumbnail: created.user.photo?.[0]?.thumbnail || null,
    });
  } catch (error) {
    console.error("Error adding user to project:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar rol de un miembro del proyecto
export const updateProjectMember = async (req, res) => {
  const { memberId } = req.params;
  const { role } = req.body;

  try {
    const updated = await db.projectMember.update({
      where: { id: memberId },
      data: { role },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating project member:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ❌ Eliminar miembro del proyecto
export const removeUserFromProject = async (req, res) => {
  const { projectId, memberId } = req.params;
  console.log(`Removing member ${memberId} from project ${projectId}`);

  try {
    // 1) Obtengo el registro
    const member = await db.projectMember.findFirst({
      where: { userId: memberId, projectId },
    });

    if (!member) {
      return res
        .status(404)
        .json({ error: "Miembro no encontrado en el proyecto" });
    }

    // 2) Borro usando el id (clave única)
    await db.projectMember.delete({
      where: { id: member.id },
    });

    res.status(200).json({ message: "Miembro eliminado del proyecto" });
  } catch (error) {
    console.error("Error removing project member:", error);
    res.status(500).json({ error: error.message });
  }
};
