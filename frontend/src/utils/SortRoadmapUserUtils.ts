import { RoadmapUser, Task, Customer } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';
import { unratedTasksAmount } from './TaskUtils';
import {
  SortingOrders,
  SortComparison,
  sorted,
  sortKeyLocale,
  sortKeyNumeric,
} from './SortUtils';

export { SortingOrders } from './SortUtils';

export enum UserSortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_EMAIL,
  SORT_ROLE,
  SORT_UNRATED,
}

const userCompare = (
  sortingType: UserSortingTypes,
  tasks: Task[],
  customers?: Customer[],
): SortComparison<RoadmapUser> | undefined => {
  switch (sortingType) {
    case UserSortingTypes.SORT_NAME:
      return sortKeyLocale(({ username }) => username);
    case UserSortingTypes.SORT_EMAIL:
      return sortKeyLocale(({ email }) => email);
    case UserSortingTypes.SORT_ROLE:
      return sortKeyLocale(({ type }) => RoleType[type]);
    case UserSortingTypes.SORT_UNRATED:
      return sortKeyNumeric((user) =>
        unratedTasksAmount(user, tasks, customers),
      );
    default:
      // SortingTypes.NO_SORT
      break;
  }
};

export const sortRoadmapUsers = (
  users: RoadmapUser[],
  type: UserSortingTypes,
  order: SortingOrders,
  tasks: Task[],
  customers?: Customer[],
) => sorted(users, userCompare(type, tasks, customers), order);
