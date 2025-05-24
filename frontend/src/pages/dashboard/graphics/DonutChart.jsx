import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultColors = [
  'rgba(34, 197, 94, 0.6)', // verde
  'rgba(250, 204, 21, 0.6)', // amarillo
  'rgba(239, 68, 68, 0.6)', // rojo
  'rgba(66, 133, 244, 0.6)', // azul
  'rgba(161, 66, 244, 0.6)', // morado
  'rgba(255, 112, 67, 0.6)', // naranja
  'rgba(0, 184, 217, 0.6)', // cyan
  'rgba(158, 158, 158, 0.6)', // gris
];

const defaultStatusColors = {
  ALTA: 'rgba(75, 192, 192, 0.6)',
  PROPUESTA: 'rgba(255, 206, 86, 0.6)',
  BAJA: 'rgba(255, 99, 132, 0.6)',
};

const DonutChart = ({
  title,
  subtitle,
  icon,
  dataObj,
  colors,
  height = 260,
}) => {
  const labels = Object.keys(dataObj || {});
  const dataValues = Object.values(dataObj || {});

  let backgroundColors;

  if (Array.isArray(colors)) {
    backgroundColors = colors.length
      ? colors.slice(0, labels.length)
      : defaultColors.slice(0, labels.length);
  } else if (typeof colors === 'object' && colors !== null) {
    backgroundColors = labels.map(
      (label) =>
        colors[label] ||
        defaultStatusColors[label] ||
        defaultColors[labels.indexOf(label) % defaultColors.length],
    );
  } else {
    backgroundColors = labels.map(
      (label, idx) =>
        defaultStatusColors[label] || defaultColors[idx % defaultColors.length],
    );
  }

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: '30%',
    plugins: {
      legend: { display: true, position: 'left' }, // <-- leyenda interactiva
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = dataValues.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      className="bg-white rounded-xl shadow p-6 flex flex-col"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center mb-2">
        {icon && (
          <span className="mr-2 text-2xl text-sinabe-primary">{icon}</span>
        )}
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {subtitle && <div className="text-gray-500 text-sm mb-2">{subtitle}</div>}
      <div style={{ height, minHeight: '300px' }}>
        <Doughnut data={data} options={options} />
      </div>
      {/* Leyenda nativa de Chart.js, no necesitas renderizarla manualmente */}
    </div>
  );
};

export default DonutChart;
