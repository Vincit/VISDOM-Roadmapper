export const daysAgo = (days: number) => {
  const dateNow = new Date();
  dateNow.setDate(dateNow.getDate() - days);
  return dateNow;
};

export const isExactlyDaysAgo = (date: Date, days: number) => {
  const comparingDate = daysAgo(days);
  return (
    date.getDate() === comparingDate.getDate() &&
    date.getMonth() === comparingDate.getMonth() &&
    date.getFullYear() === comparingDate.getFullYear()
  );
};

export const isToday = (date: Date) => {
  return isExactlyDaysAgo(date, 0);
};

export const isYesterday = (date: Date) => {
  return isExactlyDaysAgo(date, 1);
};
