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

const defaultColor = 'rgba(59,130,246,1)'; // azul-500
const defaultFill = 'rgba(59,130,246,0.12)'; // azul-500 con opacidad

const AreaChart = ({
  title,
  subtitle,
  icon,
  labels = [],
  dataValues = [],
  color = defaultColor,
  fillColor = defaultFill,
  height = 340,
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        fill: true,
        backgroundColor: fillColor,
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default AreaChart;
