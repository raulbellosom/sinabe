import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const defaultColors = [
  '#3b82f6', // azul-500
  '#22c55e', // verde-500
  '#fbbf24', // amarillo-400
  '#ef4444', // rojo-500
  '#a855f7', // morado-500
  '#fb923c', // naranja-400
  '#06b6d4', // cyan-500
  '#9ca3af', // gris-400
  '#fde047', // amarillo-300
  '#15803d', // verde-700
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-xs shadow-lg border border-gray-200 dark:border-neutral-700">
        <p className="font-semibold text-gray-900 dark:text-white">{d.name}</p>
        <p>
          {d.value}{' '}
          <span className="text-gray-500 dark:text-gray-400">
            ({d.percent}%)
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const PolarAreaChart = ({
  title,
  subtitle,
  icon,
  dataObj,
  colors = defaultColors,
}) => {
  const labels = Object.keys(dataObj || {});
  const dataValues = Object.values(dataObj || {}).map((v) => Number(v) || 0);
  const total = dataValues.reduce((a, b) => a + b, 0);

  let colorMap;
  if (Array.isArray(colors)) {
    colorMap = colors.length ? colors : defaultColors;
  } else if (typeof colors === 'object' && colors !== null) {
    colorMap = labels.map(
      (label, idx) =>
        colors[label] || defaultColors[idx % defaultColors.length],
    );
  } else {
    colorMap = defaultColors;
  }

  // Sort data descending so the largest bar is outermost (Recharts renders last item outermost)
  const chartData = labels
    .map((label, idx) => ({
      name: label,
      value: dataValues[idx],
      percent: total ? ((dataValues[idx] / total) * 100).toFixed(1) : '0',
      fill: Array.isArray(colorMap)
        ? colorMap[idx % colorMap.length]
        : colorMap[idx],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow dark:shadow-neutral-900/50 p-6 flex flex-col min-h-[340px]">
      <div className="flex items-center mb-2">
        {icon && (
          <span className="mr-2 text-2xl text-sinabe-primary">{icon}</span>
        )}
        <h2 className="font-bold text-lg dark:text-white">{title}</h2>
      </div>
      {subtitle && (
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          {subtitle}
        </div>
      )}
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="15%"
            outerRadius="85%"
            barSize={10}
            data={chartData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              background={{ fill: '#d1d5db', opacity: 0.35 }}
              dataKey="value"
              cornerRadius={6}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {chartData.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            {entry.name}{' '}
            <span className="text-gray-400 dark:text-gray-500">
              ({entry.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolarAreaChart;
