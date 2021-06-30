import convert from 'color-convert';
import {
  Customer,
  PlannerCustomerWeight,
  CheckableUser,
  Task,
} from '../redux/roadmaps/types';
import { unratedTasksAmount } from './TaskUtils';

import {
  SortingOrders,
  SortComparison,
  sorted,
  sortKeyLocale,
  sortKeyNumeric,
} from './SortUtils';

export { SortingOrders } from './SortUtils';

export enum CustomerSortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_EMAIL,
  SORT_VALUE,
  SORT_COLOR,
  SORT_UNRATED,
}

export const customerWeight = (
  { id, weight }: Customer,
  planned?: PlannerCustomerWeight[],
) => planned?.find((plan) => plan.customerId === id)?.weight ?? weight;

const customerCompare = (
  sortingType: CustomerSortingTypes,
  tasks: Task[],
  plannedWeights?: PlannerCustomerWeight[],
): SortComparison<Customer> | undefined => {
  switch (sortingType) {
    case CustomerSortingTypes.SORT_NAME:
      return sortKeyLocale(({ name }) => name);
    case CustomerSortingTypes.SORT_EMAIL:
      return sortKeyLocale(({ email }) => email);
    case CustomerSortingTypes.SORT_VALUE:
      return sortKeyNumeric((customer) =>
        customerWeight(customer, plannedWeights),
      );
    case CustomerSortingTypes.SORT_COLOR:
      return sortKeyLocale(({ color }) => color || '');
    case CustomerSortingTypes.SORT_UNRATED:
      return sortKeyNumeric((customer) => unratedTasksAmount(customer, tasks));
    default:
      // SortingTypes.NO_SORT
      break;
  }
};

export const sortCustomers = (
  customers: Customer[],
  type: CustomerSortingTypes,
  order: SortingOrders,
  tasks: Task[],
  plannedWeights?: PlannerCustomerWeight[],
) => sorted(customers, customerCompare(type, tasks, plannedWeights), order);

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
