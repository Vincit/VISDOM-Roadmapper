import convert from 'color-convert';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';
import { UserInfo } from '../redux/user/types';

export const isCustomer = (
  user: Customer | RoadmapUser | UserInfo,
): user is Customer => 'representatives' in user;

const difference = (first: number, second: number) =>
  180 - Math.abs(Math.abs(first - second) - 180);

export const randomColor = (
  customers: { color: string }[] | undefined,
  tries: number = 1,
): string => {
  const hue = Math.random() * 360;
  const found = customers?.some(
    (obj) => obj.color && difference(convert.hex.hsl(obj.color)[0], hue) < 30,
  );
  if (tries === 20) return `#${convert.hsl.hex([hue, 100, 65])}`;
  if (found) return randomColor(customers, tries + 1);
  return `#${convert.hsl.hex([hue, 100, 65])}`;
};

export const getCheckedIds = <T>(array: { checked: boolean; id: T }[]) => {
  return array.filter(({ checked }) => checked).map(({ id }) => id);
};

export const targetCustomerStakes = (customers: Customer[]) => {
  const totalValue = customers.reduce((acc, { weight }) => acc + weight, 0);
  return [...customers]
    .sort((a, b) => b.weight - a.weight)
    .map(({ id, weight }) => ({
      id,
      target: weight / totalValue,
    }));
};

export const stakesDifferTooMuchFromTarget = (actual: number, target: number) =>
  (actual - target) / target < -0.3;
