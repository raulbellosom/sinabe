import { Package } from 'lucide-react';

const statusStyles = {
  ALTA: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  PROPUESTA:
    'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
  BAJA: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
};

const TableChart = ({
  title,
  subtitle,
  icon,
  columns = [],
  rows = [],
  statusKey = 'status', // la key para el estado
}) => {
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm mt-2">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400 font-semibold border-b dark:border-neutral-700">
              {columns.map((col) => (
                <th key={col.key} className="py-2 px-2 text-left">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-400 dark:text-gray-500"
                >
                  Sin registros recientes
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b dark:border-neutral-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-neutral-700/50 odd:bg-white dark:odd:bg-neutral-800 even:bg-gray-50 dark:even:bg-neutral-700/30 whitespace-nowrap dark:text-gray-300"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-2 align-middle">
                    {col.key === statusKey ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[row[col.key]] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        {row[col.key]}
                      </span>
                    ) : col.icon ? (
                      <span className="inline-flex items-center gap-2">
                        {col.icon(row)}
                        {row[col.key]}
                      </span>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableChart;
