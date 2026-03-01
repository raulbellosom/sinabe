import { useState, useCallback } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
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

const isDark = () => document.documentElement.classList.contains('dark');

const CustomPieTooltip = ({ active, payload }) => {
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
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={3}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const PieChart = ({
  title,
  subtitle,
  icon,
  dataObj,
  colors = defaultColors,
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hiddenKeys, setHiddenKeys] = useState(new Set());
  const onPieEnter = useCallback((_, index) => setActiveIndex(index), []);
  const onPieLeave = useCallback(() => setActiveIndex(-1), []);

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
        colors[label] || defaultColors[idx % defaultColors.length],
    );
  } else {
    colorMap = defaultColors;
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
          <RechartsPie>
            <Pie
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="70%"
              paddingAngle={2}
              cornerRadius={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={100}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry._color}
                  stroke="none"
                  opacity={activeIndex >= 0 && activeIndex !== idx ? 0.4 : 1}
                  style={{ transition: 'opacity 200ms ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </RechartsPie>
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

export default PieChart;
