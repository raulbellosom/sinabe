import { useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from 'recharts';

const defaultColors = [
  '#22c55e', // verde
  '#facc15', // amarillo
  '#ef4444', // rojo
  '#4285f4', // azul
  '#a142f4', // morado
  '#ff7043', // naranja
  '#00b8d9', // cyan
  '#9e9e9e', // gris
];

const isDark = () => document.documentElement.classList.contains('dark');

const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const total = payload[0].payload._total || 1;
    const pct = ((value / total) * 100).toFixed(1);
    return (
      <div className="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-xs shadow-lg border border-gray-200 dark:border-neutral-700">
        <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
        <p>
          {value.toLocaleString()}{' '}
          <span className="text-gray-500 dark:text-gray-400">({pct}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const defaultStatusColors = {
  ALTA: '#4bc0c0',
  PROPUESTA: '#ffce56',
  BAJA: '#ff6384',
};

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;

  const dark = isDark();
  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-4}
        textAnchor="middle"
        fill={dark ? '#e5e5e5' : '#374151'}
        style={{ fontSize: '14px', fontWeight: 600 }}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={16}
        textAnchor="middle"
        fill={dark ? '#a3a3a3' : '#6b7280'}
        style={{ fontSize: '12px' }}
      >
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

const DonutChart = ({ title, subtitle, icon, dataObj, colors }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback((_, index) => setActiveIndex(index), []);

  const labels = Object.keys(dataObj || {});
  const dataValues = Object.values(dataObj || {});

  let colorMap;
  if (Array.isArray(colors)) {
    colorMap = colors.length ? colors : defaultColors;
  } else if (typeof colors === 'object' && colors !== null) {
    colorMap = labels.map(
      (label, idx) =>
        colors[label] ||
        defaultStatusColors[label] ||
        defaultColors[idx % defaultColors.length],
    );
  } else {
    colorMap = labels.map(
      (label, idx) =>
        defaultStatusColors[label] || defaultColors[idx % defaultColors.length],
    );
  }

  const total = dataValues.reduce((a, b) => a + b, 0);
  const chartData = labels.map((label, idx) => ({
    name: label,
    value: dataValues[idx],
    _total: total,
  }));

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
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="65%"
              paddingAngle={3}
              cornerRadius={4}
              dataKey="value"
              onMouseEnter={onPieEnter}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={
                    Array.isArray(colorMap)
                      ? colorMap[idx % colorMap.length]
                      : colorMap[idx]
                  }
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomDonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {chartData.map((entry, idx) => (
          <div
            key={entry.name}
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:opacity-80 transition-opacity"
            onMouseEnter={() => setActiveIndex(idx)}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: Array.isArray(colorMap)
                  ? colorMap[idx % colorMap.length]
                  : colorMap[idx],
              }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
