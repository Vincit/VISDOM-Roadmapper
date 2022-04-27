export const convertScale = (rating: number) => {
  const converted = rating ** 2;
  return converted;
};

export const revertScale = (rating: number) => {
  const reverted = Math.sqrt(rating);
  return reverted;
};
