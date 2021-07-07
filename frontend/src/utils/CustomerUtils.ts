import convert from 'color-convert';
import {
  Customer,
  PlannerCustomerWeight,
  CheckableUser,
  RoadmapUser,
} from '../redux/roadmaps/types';
import { UserInfo } from '../redux/user/types';

export const isCustomer = (
  user: Customer | RoadmapUser | UserInfo,
): user is Customer => 'representatives' in user;

export const customerWeight = (
  { id, weight }: Customer,
  planned?: PlannerCustomerWeight[],
) => planned?.find((plan) => plan.customerId === id)?.weight ?? weight;

const difference = (first: number, second: number) =>
  180 - Math.abs(Math.abs(first - second) - 180);

export const randomColor = (
  customers: Customer[] | undefined,
  tries: number = 1,
): string => {
  const hue = Math.random() * 360;
  const found = customers?.some((obj) => {
    if (obj.color) return difference(convert.hex.hsl(obj.color)[0], hue) < 30;
  });
  if (tries === 20) return `#${convert.hsl.hex([hue, 100, 65])}`;
  if (found) return randomColor(customers, tries + 1);
  return `#${convert.hsl.hex([hue, 100, 65])}`;
};

export const getCheckedIds = (reps: CheckableUser[]) => {
  return reps.filter((rep) => rep.checked).map(({ id }) => id);
};
