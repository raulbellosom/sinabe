import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const statusConfig = {
  ALTA: {
    label: 'Inventarios en Alta',
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-700',
    text: 'text-green-700 dark:text-green-400',
    textNumber: 'text-green-900 dark:text-green-300',
    icon: <TrendingUp className="text-green-400 dark:text-green-500" size={24} />,
  },
  PROPUESTA: {
    label: 'En Propuesta',
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-700',
    text: 'text-yellow-700 dark:text-yellow-400',
    textNumber: 'text-yellow-900 dark:text-yellow-300',
    icon: <Minus className="text-yellow-400 dark:text-yellow-500" size={24} />,
  },
  BAJA: {
    label: 'Inventarios en Baja',
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700',
    text: 'text-red-700 dark:text-red-400',
    textNumber: 'text-red-900 dark:text-red-300',
    icon: <TrendingDown className="text-red-400 dark:text-red-500" size={24} />,
  },
};

const InventoryStatusCards = ({ total, byStatus }) => {
  const navigate = useNavigate();
  const totalCount = total || 0;
  const alta = byStatus.ALTA || 0;
  const propuesta = byStatus.PROPUESTA || 0;
  const baja = byStatus.BAJA || 0;

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Total */}
      <div
        className="rounded-xl border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/30 p-5 shadow dark:shadow-neutral-900/50 flex flex-col justify-between min-h-[120px] cursor-pointer"
        onDoubleClick={() => navigate('/inventories')}
        title="Ver todos los inventarios"
        onClick={isMobile ? () => navigate('/inventories') : undefined}
      >
        <div className="flex justify-between items-center">
          <span className="text-blue-700 dark:text-blue-400 font-medium">Total Inventarios</span>
          <Package className="text-blue-400 dark:text-blue-500" size={24} />
        </div>
        <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-300">
          {totalCount.toLocaleString()}
        </div>
        <span className="text-blue-700 dark:text-blue-400 text-sm">&nbsp;</span>
      </div>
      {/* ALTA */}
      <div
        className={`rounded-xl border-l-4 ${statusConfig.ALTA.border} ${statusConfig.ALTA.bg} p-5 shadow dark:shadow-neutral-900/50 flex flex-col justify-between min-h-[120px] cursor-pointer`}
        onDoubleClick={() => navigate('/inventories?status=ALTA')}
        title="Ver inventarios en Alta"
        onClick={
          isMobile ? () => navigate('/inventories?status=ALTA') : undefined
        }
      >
        <div className="flex justify-between items-center">
          <span className={statusConfig.ALTA.text + ' font-medium'}>
            {statusConfig.ALTA.label}
          </span>
          {statusConfig.ALTA.icon}
        </div>
        <div className={`mt-2 text-3xl font-bold ${statusConfig.ALTA.textNumber}`}>
          {alta.toLocaleString()}
        </div>
        <span className={`${statusConfig.ALTA.text} text-sm`}>
          {totalCount ? ((alta / totalCount) * 100).toFixed(1) : 0}% del total
        </span>
      </div>
      {/* PROPUESTA */}
      <div
        className={`rounded-xl border-l-4 ${statusConfig.PROPUESTA.border} ${statusConfig.PROPUESTA.bg} p-5 shadow dark:shadow-neutral-900/50 flex flex-col justify-between min-h-[120px] cursor-pointer`}
        onDoubleClick={() => navigate('/inventories?status=PROPUESTA')}
        title="Ver inventarios en Propuesta"
        onClick={
          isMobile ? () => navigate('/inventories?status=PROPUESTA') : undefined
        }
      >
        <div className="flex justify-between items-center">
          <span className={statusConfig.PROPUESTA.text + ' font-medium'}>
            {statusConfig.PROPUESTA.label}
          </span>
          {statusConfig.PROPUESTA.icon}
        </div>
        <div className={`mt-2 text-3xl font-bold ${statusConfig.PROPUESTA.textNumber}`}>
          {propuesta.toLocaleString()}
        </div>
        <span className={`${statusConfig.PROPUESTA.text} text-sm`}>
          {totalCount ? ((propuesta / totalCount) * 100).toFixed(1) : 0}% del
          total
        </span>
      </div>
      {/* BAJA */}
      <div
        className={`rounded-xl border-l-4 ${statusConfig.BAJA.border} ${statusConfig.BAJA.bg} p-5 shadow dark:shadow-neutral-900/50 flex flex-col justify-between min-h-[120px] cursor-pointer`}
        onDoubleClick={() => navigate('/inventories?status=BAJA')}
        title="Ver inventarios en Baja"
        onClick={
          isMobile ? () => navigate('/inventories?status=BAJA') : undefined
        }
      >
        <div className="flex justify-between items-center">
          <span className={statusConfig.BAJA.text + ' font-medium'}>
            {statusConfig.BAJA.label}
          </span>
          {statusConfig.BAJA.icon}
        </div>
        <div className={`mt-2 text-3xl font-bold ${statusConfig.BAJA.textNumber}`}>
          {baja.toLocaleString()}
        </div>
        <span className={`${statusConfig.BAJA.text} text-sm`}>
          {totalCount ? ((baja / totalCount) * 100).toFixed(1) : 0}% del total
        </span>
      </div>
    </div>
  );
};

export default InventoryStatusCards;
