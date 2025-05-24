import { FaBoxOpen } from 'react-icons/fa';

const statusStyles = {
  ALTA: 'bg-green-100 text-green-700',
  PROPUESTA: 'bg-yellow-100 text-yellow-700',
  BAJA: 'bg-red-100 text-red-700',
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
    <div className="bg-white rounded-xl shadow p-6 flex flex-col min-h-[340px]">
      <div className="flex items-center mb-2">
        {icon && (
          <span className="mr-2 text-2xl text-sinabe-primary">{icon}</span>
        )}
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {subtitle && <div className="text-gray-500 text-sm mb-2">{subtitle}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm mt-2">
          <thead>
            <tr className="text-gray-500 font-semibold border-b">
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
                  className="text-center py-8 text-gray-400"
                >
                  Sin registros recientes
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b last:border-b-0 hover:bg-gray-50 odd:bg-white even:bg-gray-50 whitespace-nowrap"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-2 align-middle">
                    {col.key === statusKey ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[row[col.key]] || 'bg-gray-100 text-gray-700'}`}
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
