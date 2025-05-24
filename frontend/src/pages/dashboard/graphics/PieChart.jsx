import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultColors = [
  'rgba(59,130,246,0.6)', // azul-500
  'rgba(34,197,94,0.6)', // verde-500
  'rgba(251,191,36,0.6)', // amarillo-400
  'rgba(239,68,68,0.6)', // rojo-500
  'rgba(168,85,247,0.6)', // morado-500
  'rgba(251,146,60,0.6)', // naranja-400
  'rgba(6,182,212,0.6)', // cyan-500
  'rgba(156,163,175,0.6)', // gris-400
  'rgba(253,224,71,0.6)', // amarillo-300
  'rgba(21,128,61,0.6)', // verde-700
];

const PieChart = ({
  title,
  subtitle,
  icon,
  dataObj,
  colors = defaultColors,
  height = 260,
}) => {
  const labels = Object.keys(dataObj || {});
  const dataValues = Object.values(dataObj || {});

  // Permite pasar colors como array o como objeto {label: color}
  let backgroundColors;
  if (Array.isArray(colors)) {
    backgroundColors = colors.length
      ? colors.slice(0, labels.length)
      : defaultColors.slice(0, labels.length);
  } else if (typeof colors === 'object' && colors !== null) {
    backgroundColors = labels.map(
      (label) =>
        colors[label] ||
        defaultColors[labels.indexOf(label) % defaultColors.length],
    );
  } else {
    backgroundColors = defaultColors.slice(0, labels.length);
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
    plugins: {
      legend: {
        display: true,
        position: 'left', // leyenda interactiva nativa
      },
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
      {/* Fija la altura solo al div del gráfico */}
      <div style={{ height, minHeight: '300px' }}>
        <Pie data={data} options={options} />
      </div>
      {/* La leyenda nativa de Chart.js se muestra automáticamente abajo */}
    </div>
  );
};

export default PieChart;
