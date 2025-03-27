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
