import { db } from "../lib/db.js";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import es from "date-fns/locale/es";

// Helper para obtener los últimos N meses (incluyendo año si es diferente al actual)
function getLastMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const year = date.getFullYear();
    const month = date.getMonth();
    months.push({ year, month });
  }
  return months;
}

export const getDashboardData = async (req, res) => {
  try {
    // 1. Cards por status
    const statusCounts = await db.inventory.groupBy({
      by: ["status"],
      where: { enabled: true },
      _count: { _all: true },
    });
    const totalInventories = await db.inventory.count({
      where: { enabled: true },
    });

    // 2. Distribución por tipo
    const typeDistribution = await db.inventory.groupBy({
      by: ["modelId"],
      where: { enabled: true },
      _count: { _all: true },
    });
    const typeDetails = await db.model.findMany({
      where: { enabled: true },
      include: { type: true },
    });
    const typeMap = {};
    typeDetails.forEach((m) => {
      typeMap[m.id] = m.type.name;
    });
    const typeResult = {};
    typeDistribution.forEach((t) => {
      const typeName = typeMap[t.modelId] || "Otro";
      typeResult[typeName] = (typeResult[typeName] || 0) + t._count._all;
    });

    // 3. Distribución por marca
    const brandDistribution = await db.inventory.groupBy({
      by: ["modelId"],
      where: { enabled: true },
      _count: { _all: true },
    });
    const brandDetails = await db.model.findMany({
      where: { enabled: true },
      include: { brand: true },
    });
    const brandMap = {};
    brandDetails.forEach((m) => {
      brandMap[m.id] = m.brand.name;
    });
    const brandResult = {};
    brandDistribution.forEach((b) => {
      const brandName = brandMap[b.modelId] || "Otro";
      brandResult[brandName] = (brandResult[brandName] || 0) + b._count._all;
    });

    // 4. Inventarios por condición
    const conditionCounts = await db.inventoryCondition.groupBy({
      by: ["conditionId"],
      _count: { _all: true },
    });
    const conditionDetails = await db.condition.findMany();
    const conditionMap = {};
    conditionDetails.forEach((c) => {
      conditionMap[c.id] = c.name;
    });
    const conditionResult = {};
    conditionCounts.forEach((c) => {
      const condName = conditionMap[c.conditionId] || "Otro";
      conditionResult[condName] =
        (conditionResult[condName] || 0) + c._count._all;
    });

    // 5. Inventarios por status (pie chart)
    const statusPie = {};
    statusCounts.forEach((s) => {
      statusPie[s.status] = s._count._all;
    });

    // 6. Inventarios creados por mes (últimos 12 meses)
    const months = getLastMonths(12);
    const inventoriesByMonth = [];
    for (const { year, month } of months) {
      const start = startOfMonth(new Date(year, month));
      const end = endOfMonth(new Date(year, month));
      const count = await db.inventory.count({
        where: {
          enabled: true,
          createdAt: { gte: start, lte: end },
        },
      });
      inventoriesByMonth.push({
        label:
          year === new Date().getFullYear()
            ? format(new Date(year, month), "MMM", { locale: es })
            : format(new Date(year, month), "MMM yyyy", { locale: es }),
        count,
        year,
        month: month + 1,
      });
    }

    // 7. Últimos 5 inventarios creados
    const latestInventories = await db.inventory.findMany({
      where: { enabled: true },
      orderBy: { updatedAt: "desc" }, // Cambia aquí de createdAt a updatedAt
      take: 5,
      include: {
        model: { include: { type: true, brand: true } },
      },
    });

    // 8. Modelos más frecuentes (top 8)
    const modelCounts = await db.inventory.groupBy({
      by: ["modelId"],
      where: { enabled: true },
      _count: { modelId: true },
      orderBy: { _count: { modelId: "desc" } },
      take: 8,
    });
    const modelNames = await db.model.findMany({
      where: { id: { in: modelCounts.map((m) => m.modelId) } },
    });
    const modelNameMap = {};
    modelNames.forEach((m) => {
      modelNameMap[m.id] = m.name;
    });
    const frequentModels = modelCounts.map((m) => ({
      model: modelNameMap[m.modelId] || "Otro",
      count: m._count.modelId,
    }));

    // 9. Inventarios creados por usuario mensuales (stacked bar)
    const rootRole = await db.role.findFirst({
      where: { name: { contains: "root" } },
    });
    const rootUserIds = rootRole
      ? (
          await db.user.findMany({
            where: { enabled: true, roleId: rootRole.id },
            select: { id: true },
          })
        ).map((u) => u.id)
      : [];
    const users = await db.user.findMany({
      where: {
        enabled: true,
        NOT: rootUserIds.length ? { id: { in: rootUserIds } } : undefined,
      },
      select: { id: true, firstName: true, lastName: true },
    });
    const userMap = {};
    users.forEach((u) => {
      userMap[u.id] = `${u.firstName} ${u.lastName}`;
    });

    // Para cada usuario y mes, contar inventarios
    const userMonthData = {};
    for (const user of users) {
      userMonthData[user.id] = [];
      for (const { year, month } of months) {
        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        const count = await db.inventory.count({
          where: {
            enabled: true,
            createdById: user.id,
            createdAt: { gte: start, lte: end },
          },
        });
        userMonthData[user.id].push(count);
      }
    }

    // Formato para stacked bar: [{ user: "Nombre", data: [mes1, mes2, ...] }]
    const inventoriesByUserMonthly = Object.entries(userMonthData).map(
      ([userId, data]) => ({
        user: userMap[userId],
        data,
      })
    );

    res.json({
      cards: {
        total: totalInventories,
        byStatus: statusPie,
      },
      distribution: {
        byType: typeResult,
        byBrand: brandResult,
        byCondition: conditionResult,
        byStatus: statusPie,
      },
      inventoriesByMonth,
      latestInventories,
      frequentModels,
      inventoriesByUserMonthly,
      months: months.map(({ year, month }) =>
        year === new Date().getFullYear()
          ? format(new Date(year, month), "MMM", { locale: es })
          : format(new Date(year, month), "MMM yyyy", { locale: es })
      ),
    });
  } catch (error) {
    console.error("Error in dashboard:", error);
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
};
