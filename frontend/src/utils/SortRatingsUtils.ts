import { Taskrating } from '../redux/roadmaps/types';
import { SortBy, sortKeyNumeric } from './SortUtils';

export enum TaskRatingSortingTypes {
  SORT_FOR_CUSTOMER,
  SORT_CREATED_BY_USER,
  SORT_VALUE_ASCENDING,
  SORT_VALUE_DESCENDING,
}

export const TaskRatingSortingTypesToText = (
  type: TaskRatingSortingTypes | undefined,
) => {
  switch (type) {
    case TaskRatingSortingTypes.SORT_FOR_CUSTOMER:
      return 'Customer';
    case TaskRatingSortingTypes.SORT_CREATED_BY_USER:
      return 'Creator';
    case TaskRatingSortingTypes.SORT_VALUE_ASCENDING:
      return 'Value ascending';
    case TaskRatingSortingTypes.SORT_VALUE_DESCENDING:
      return 'Value descending';
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
    case TaskRatingSortingTypes.SORT_VALUE_ASCENDING:
      return sortKeyNumeric('value');
    case TaskRatingSortingTypes.SORT_VALUE_DESCENDING:
      return sortKeyNumeric('value', { reverse: true });
    default:
      break;
  }
};
