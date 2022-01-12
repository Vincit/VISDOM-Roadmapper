export const daysAgo = (days: number) => {
  const dateNow = new Date();
  dateNow.setDate(dateNow.getDate() - days);
  return dateNow;
};
