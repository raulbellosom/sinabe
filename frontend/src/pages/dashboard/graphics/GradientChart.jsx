import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-lg text-xs shadow-lg border border-gray-200 dark:border-neutral-700 min-w-[140px]">
        <p className="font-semibold mb-1.5 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700 pb-1">
          {label}
        </p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex justify-between gap-3 py-0.5">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </span>
            <span className="font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const GradientChart = ({
  title,
  subtitle,
  icon,
  labels = [],
  usersData = [],
  height = 340,
  colors = defaultColors,
}) => {
  const [hoveredUser, setHoveredUser] = useState(null);

  // Transform data for Recharts: array of { name: month, user1: val, user2: val, ... }
  const chartData = labels.map((label, monthIdx) => {
    const point = { name: label };
    usersData.forEach((user) => {
      point[user.user] = user.data[monthIdx] || 0;
    });
    return point;
  });

  return (
    <div
      className="bg-white dark:bg-neutral-800 rounded-xl shadow dark:shadow-neutral-900/50 p-6 flex flex-col"
      style={{ minHeight: height + 40 }}
    >
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
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {usersData.map((user, idx) => (
                <linearGradient
                  key={user.user}
                  id={`grad-${idx}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={colors[idx % colors.length]}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors[idx % colors.length]}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-neutral-200, #e5e7eb)"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-gray-500, #64748b)', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--color-gray-500, #64748b)', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              dx={-4}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#6b7280',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            {usersData.map((user, idx) => {
              const color = colors[idx % colors.length];
              const isHovered =
                hoveredUser === null || hoveredUser === user.user;
              return (
                <Area
                  key={user.user}
                  type="monotone"
                  dataKey={user.user}
                  name={user.user}
                  stroke={color}
                  strokeWidth={hoveredUser === user.user ? 3 : 2}
                  fill={`url(#grad-${idx})`}
                  fillOpacity={isHovered ? 1 : 0.15}
                  strokeOpacity={isHovered ? 1 : 0.3}
                  dot={{ r: 3, fill: color, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{
                    r: 5,
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  animationBegin={idx * 150}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              );
            })}
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              onMouseEnter={(e) => setHoveredUser(e.value)}
              onMouseLeave={() => setHoveredUser(null)}
              formatter={(value) => (
                <span className="text-gray-600 dark:text-gray-400">
                  {value}
                </span>
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GradientChart;
