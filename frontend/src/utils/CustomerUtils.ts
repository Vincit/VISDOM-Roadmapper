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
