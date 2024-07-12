const DateLocalParced = (date) => {
  const newDate = new Date(date);
  const formattedDate = newDate.toISOString().split('T')[0];
  return formattedDate;
};

export default DateLocalParced;
