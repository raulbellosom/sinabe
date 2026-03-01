import { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
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
  const [hiddenKeys, setHiddenKeys] = useState(new Set());

  const toggleKey = (name) =>
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

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

  // Build full dataset sorted by value, group beyond top 7 into "Otros"
  const TOP_N = 7;
  const sorted = labels
    .map((label, idx) => ({
      name: label,
      value: dataValues[idx],
      fill: Array.isArray(colorMap)
        ? colorMap[idx % colorMap.length]
        : colorMap[idx],
    }))
    .sort((a, b) => b.value - a.value);

  const topItems = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const othersValue = rest.reduce((sum, d) => sum + d.value, 0);

  const allData = [
    ...topItems.map((d) => ({
      ...d,
      percent: total ? ((d.value / total) * 100).toFixed(1) : '0',
    })),
    ...(othersValue > 0
      ? [
          {
            name: 'Otros',
            value: othersValue,
            percent: total ? ((othersValue / total) * 100).toFixed(1) : '0',
            fill: '#9ca3af',
          },
        ]
      : []),
  ];

  const chartData = allData
    .filter((d) => !hiddenKeys.has(d.name))
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
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={280}>
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
        {allData.map((entry) => {
          const hidden = hiddenKeys.has(entry.name);
          return (
            <button
              key={entry.name}
              type="button"
              className={`flex items-center gap-1.5 text-xs cursor-pointer transition-all duration-200 ${
                hidden
                  ? 'opacity-40 line-through text-gray-400 dark:text-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:opacity-80'
              }`}
              onClick={() => toggleKey(entry.name)}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full transition-opacity"
                style={{
                  backgroundColor: entry.fill,
                  opacity: hidden ? 0.3 : 1,
                }}
              />
              {entry.name}{' '}
              <span className={hidden ? 'text-gray-400 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'}>
                ({entry.percent}%)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PolarAreaChart;
