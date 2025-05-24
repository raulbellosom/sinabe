import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
);

const defaultColors = [
  'rgba(59,130,246,1)', // azul-500
  'rgba(34,197,94,1)', // verde-500
  'rgba(251,191,36,1)', // amarillo-400
  'rgba(239,68,68,1)', // rojo-500
  'rgba(168,85,247,1)', // morado-500
  'rgba(251,146,60,1)', // naranja-400
  'rgba(6,182,212,1)', // cyan-500
  'rgba(156,163,175,1)', // gris-400
  'rgba(253,224,71,1)', // amarillo-300
  'rgba(21,128,61,1)', // verde-700
];

const defaultFills = [
  'rgba(59,130,246,0.12)',
  'rgba(34,197,94,0.12)',
  'rgba(251,191,36,0.12)',
  'rgba(239,68,68,0.12)',
  'rgba(168,85,247,0.12)',
  'rgba(251,146,60,0.12)',
  'rgba(6,182,212,0.12)',
  'rgba(156,163,175,0.12)',
  'rgba(253,224,71,0.12)',
  'rgba(21,128,61,0.12)',
];

const GradientChart = ({
  title,
  subtitle,
  icon,
  labels = [],
  usersData = [],
  height = 340,
  colors = defaultColors,
  fills = defaultFills,
}) => {
  const chartRef = useRef(null);

  const datasets = usersData.map((user, idx) => ({
    label: user.user,
    data: user.data,
    fill: true,
    borderColor: colors[idx % colors.length],
    backgroundColor: fills[idx % fills.length],
    pointBackgroundColor: colors[idx % colors.length],
    pointBorderColor: '#fff',
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.4,
  }));

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { color: '#64748b', font: { size: 14 } },
      },
    },
  };

  return (
    <div
      className="bg-white rounded-xl shadow p-6 flex flex-col"
      style={{ minHeight: height + 40 }}
    >
      <div className="flex items-center mb-2">
        {icon && (
          <span className="mr-2 text-2xl text-sinabe-primary">{icon}</span>
        )}
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {subtitle && <div className="text-gray-500 text-sm mb-2">{subtitle}</div>}
      <div style={{ height }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};

export default GradientChart;
