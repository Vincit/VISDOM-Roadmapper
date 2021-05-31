import convert from 'color-convert';
import { Customer } from '../redux/roadmaps/types';

const difference = (first: number, second: number) =>
  180 - Math.abs(Math.abs(first - second) - 180);

export const randomColor = (customers: Customer[] | undefined): string => {
  const hue = Math.random() * 360;
  const found = customers?.find((obj) => {
    if (obj.color) return difference(convert.hex.hsl(obj.color)[0], hue) < 30;
  });
  if (found) return randomColor(customers);
  return `#${convert.hsl.hex([hue, 100, 65])}`;
};
