export function convertScale(rating: number): number;
export function convertScale(rating: number | undefined): number | undefined;
export function convertScale(rating: number | undefined) {
  if (rating === undefined) return undefined;
  else if (rating < 0) return rating;
  return rating ** 2;
}

export function revertScale(rating: number): number;
export function revertScale(rating: number | undefined): number | undefined;
export function revertScale(rating: number | undefined) {
  if (rating === undefined) return undefined;
  else if (rating < 0) return rating;
  return Math.sqrt(rating);
}
