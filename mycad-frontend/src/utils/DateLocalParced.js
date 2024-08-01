const DateLocalParced = (date) => {
  if (!date) return '';
  console.log(date);
  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleDateString('en-GB')?.split('T')[0];
  return formattedDate;
};

export default DateLocalParced;
