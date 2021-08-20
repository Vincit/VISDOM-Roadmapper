import {
  Customer,
  PlannerCustomerWeight,
  Roadmap,
} from '../redux/roadmaps/types';
import { unratedTasksAmount } from './TaskUtils';
import { customerWeight } from './CustomerUtils';

import { Sort, sortKeyLocale, sortKeyNumeric } from './SortUtils';

export enum CustomerSortingTypes {
  SORT_NAME,
  SORT_EMAIL,
  SORT_VALUE,
  SORT_COLOR,
  SORT_UNRATED,
}

export const customerSort = (
  roadmap?: Roadmap,
  plannedWeights?: PlannerCustomerWeight[],
) => (type: CustomerSortingTypes | undefined): Sort<Customer> => {
  switch (type) {
    case CustomerSortingTypes.SORT_NAME:
      return sortKeyLocale('name');
    case CustomerSortingTypes.SORT_EMAIL:
      return sortKeyLocale('email');
    case CustomerSortingTypes.SORT_VALUE:
      return sortKeyNumeric((customer) =>
        customerWeight(customer, plannedWeights),
      );
    case CustomerSortingTypes.SORT_COLOR:
      return sortKeyLocale('color');
    case CustomerSortingTypes.SORT_UNRATED:
      return (
        roadmap &&
        sortKeyNumeric((customer) => unratedTasksAmount(customer, roadmap))
      );
    default:
      break;
  }
};
