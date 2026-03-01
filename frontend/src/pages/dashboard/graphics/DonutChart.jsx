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
  const [hiddenKeys, setHiddenKeys] = useState(new Set());
  const onPieEnter = useCallback((_, index) => setActiveIndex(index), []);

  const toggleKey = (name) =>
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

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
  const allData = labels.map((label, idx) => ({
    name: label,
    value: dataValues[idx],
    _total: total,
    _color: Array.isArray(colorMap)
      ? colorMap[idx % colorMap.length]
      : colorMap[idx],
  }));
  const chartData = allData.filter((d) => !hiddenKeys.has(d.name));

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
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry._color}
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
                  backgroundColor: entry._color,
                  opacity: hidden ? 0.3 : 1,
                }}
              />
              {entry.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
