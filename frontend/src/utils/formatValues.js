export const parseToLocalDate = (date) => {
  if (!date) return '';
  const newDate = new Date(date);
  const day = newDate.getUTCDate().toString().padStart(2, '0');
  const month = (newDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = newDate.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export const parseToLocalDateTime = (date) => {
  if (!date) return '';
  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleString('en-GB');
  return formattedDate;
};

export const parseToCurrency = (value, currency) => {
  if (!value) return '';
  return value.toLocaleString('en-GB', {
    style: 'currency',
    currency: currency || 'MXN',
  });
};

export const formatConditionColor = (conditionName) => {
  const name = conditionName?.toLowerCase();

  if (!name) return 'gray';

  if (name.includes('nuevo')) return 'success';
  if (name.includes('usado') || name.includes('descompuesto')) return 'warning';
  if (name.includes('garantía') || name.includes('reparación'))
    return 'failure';
  if (
    name.includes('renta') ||
    name.includes('préstamo') ||
    name.includes('prestado')
  )
    return 'info';
  if (name.includes('venta')) return 'purple';
  if (name.includes('desuso') || name.includes('sin usar')) return 'gray';

  return 'gray';
};
