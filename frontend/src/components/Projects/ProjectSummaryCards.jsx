// src/components/Projects/ProjectSummaryCards.jsx
import { FaCheckCircle, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { FaDiagramProject } from 'react-icons/fa6';

const ProjectSummaryCards = ({ projects }) => {
  if (!Array.isArray(projects)) {
    return null; // o un Skeleton si prefieres
  }

  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === 'En Progreso').length;
  const upcomingDeadlines = projects
    .flatMap((p) => p.deadlines || [])
    .filter(
      (d) =>
        new Date(d.dueDate) > new Date() &&
        new Date(d.dueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ).length;

  const budgetTotal = projects.reduce(
    (acc, p) => acc + (p.budgetTotal || 0),
    0,
  );
  const budgetUsed = projects.reduce(
    (acc, p) =>
      acc +
      (p.purchaseOrders
        ?.flatMap((oc) => oc.invoices || [])
        .reduce((s, f) => s + (f.amount || 0), 0) || 0),
    0,
  );

  const cards = [
    {
      label: 'Total Proyectos',
      value: total,
      icon: <FaDiagramProject />,
      color: 'bg-sinabe-primary',
    },
    {
      label: 'En Progreso',
      value: inProgress,
      icon: <FaCheckCircle />,
      color: 'bg-sinabe-success',
    },
    {
      label: 'Presupuesto Total',
      value: `$${budgetTotal.toLocaleString()}`,
      sub: `Ejecutado: ${Math.round((budgetUsed / budgetTotal) * 100) || 0}%`,
      icon: <FaMoneyBillWave />,
      color: 'bg-sinabe-info',
    },
    {
      label: 'Deadlines Próximos',
      value: upcomingDeadlines,
      icon: <FaClock />,
      color: 'bg-sinabe-warning text-black',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-lg p-4 shadow flex items-center gap-4 text-white ${card.color}`}
        >
          <div className="text-2xl">{card.icon}</div>
          <div>
            <p className="text-lg font-bold">{card.value}</p>
            <p className="text-sm">{card.label}</p>
            {card.sub && <p className="text-xs opacity-80">{card.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectSummaryCards;
