export const titleCase = (s: string): string =>
  s.substr(0, 1).toLocaleUpperCase() + s.substr(1);

export const percent = (maximumFractionDigits?: number) =>
  new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits });
