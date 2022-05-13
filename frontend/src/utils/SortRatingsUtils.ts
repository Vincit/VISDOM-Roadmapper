import { Taskrating } from '../redux/roadmaps/types';
import { SortBy, sortKeyNumeric } from './SortUtils';

export enum TaskRatingSortingTypes {
  SORT_FOR_CUSTOMER,
  SORT_CREATED_BY_USER,
  SORT_VALUE,
}

export const TaskRatingSortingTypesToText = (
  type: TaskRatingSortingTypes | undefined,
) => {
  switch (type) {
    case TaskRatingSortingTypes.SORT_FOR_CUSTOMER:
      return 'Customer';
    case TaskRatingSortingTypes.SORT_CREATED_BY_USER:
      return 'Creator';
    case TaskRatingSortingTypes.SORT_VALUE:
      return 'Value';
    default:
      return 'Unspecified';
  }
};

export const taskRatingsSort = (
  type: TaskRatingSortingTypes | undefined,
): SortBy<Taskrating> => {
  switch (type) {
    case TaskRatingSortingTypes.SORT_FOR_CUSTOMER:
      return sortKeyNumeric('forCustomer');
    case TaskRatingSortingTypes.SORT_CREATED_BY_USER:
      return sortKeyNumeric('createdByUser');
    case TaskRatingSortingTypes.SORT_VALUE:
      return sortKeyNumeric('value');
    default:
      break;
  }
};
