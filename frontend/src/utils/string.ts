export const titleCase = (s: string): string =>
  s.charAt(0).toLocaleUpperCase() + s.substring(1);

export const percent = (maximumFractionDigits?: number) =>
  new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits });
