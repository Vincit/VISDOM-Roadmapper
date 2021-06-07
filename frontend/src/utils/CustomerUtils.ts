import convert from 'color-convert';
import { Customer } from '../redux/roadmaps/types';

import {
  SortingOrders,
  SortComparison,
  sorted,
  sortKeyLocale,
  sortKeyNumeric,
} from './SortUtils';

export { SortingOrders } from './SortUtils';

export enum SortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_VALUE,
}

const customerCompare = (
  sortingType: SortingTypes,
): SortComparison<Customer> | undefined => {
  switch (sortingType) {
    case SortingTypes.SORT_NAME:
      return sortKeyLocale(({ name }) => name);
    case SortingTypes.SORT_VALUE:
      return sortKeyNumeric(({ value }) => value);
    default:
      // SortingTypes.NO_SORT
      break;
  }
};

export const sortCustomers = (
  customers: Customer[],
  type: SortingTypes,
  order: SortingOrders,
) => sorted(customers, customerCompare(type), order);

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
