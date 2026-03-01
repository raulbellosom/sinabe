import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-lg text-xs shadow-lg border border-gray-200 dark:border-neutral-700">
        <p className="font-semibold mb-1 text-gray-600 dark:text-gray-300">
          {label}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
          {payload[0].value} inventarios
        </p>
      </div>
    );
  }
  return null;
};

const AreaChart = ({
  title,
  subtitle,
  icon,
  labels = [],
  dataValues = [],
  color = '#3b82f6',
  height = 340,
}) => {
  const chartData = labels.map((label, idx) => ({
    name: label,
    value: dataValues[idx] || 0,
  }));

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
      <div>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsArea
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
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
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              dot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </RechartsArea>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaChart;
