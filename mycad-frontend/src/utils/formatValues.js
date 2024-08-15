export const parseToLocalDate = (date) => {
  if (!date) return '';
  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleDateString('en-GB')?.split('T')[0];
  return formattedDate;
};

export const parseToLocalDateTime = (date) => {
  if (!date) return '';
  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleString('en-GB');
  return formattedDate;
};

export const parseToCurrency = (value) => {
  if (!value) return '';
  return value.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'MXN',
  });
};
