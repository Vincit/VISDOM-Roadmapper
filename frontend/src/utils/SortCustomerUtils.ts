import { Customer, Roadmap } from '../redux/roadmaps/types';
import { unratedTasksAmount } from './TaskUtils';

import { SortBy, sortKeyLocale, sortKeyNumeric } from './SortUtils';

export enum CustomerSortingTypes {
  SORT_NAME,
  SORT_EMAIL,
  SORT_VALUE,
  SORT_COLOR,
  SORT_UNRATED,
}

export const customerSort = (roadmap?: Roadmap) => (
  type: CustomerSortingTypes | undefined,
): SortBy<Customer> => {
  switch (type) {
    case CustomerSortingTypes.SORT_NAME:
      return sortKeyLocale('name');
    case CustomerSortingTypes.SORT_EMAIL:
      return sortKeyLocale('email');
    case CustomerSortingTypes.SORT_VALUE:
      return sortKeyNumeric('weight');
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
