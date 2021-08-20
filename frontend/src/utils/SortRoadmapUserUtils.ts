import { RoadmapUser, Task, Customer } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';
import { unratedTasksAmount } from './TaskUtils';
import { Sort, sortKeyLocale, sortKeyNumeric } from './SortUtils';

export enum UserSortingTypes {
  SORT_NAME,
  SORT_EMAIL,
  SORT_ROLE,
  SORT_UNRATED,
}

export const userSort = (tasks: Task[], customers?: Customer[]) => (
  type: UserSortingTypes | undefined,
): Sort<RoadmapUser> => {
  switch (type) {
    case UserSortingTypes.SORT_NAME:
      return sortKeyLocale('username');
    case UserSortingTypes.SORT_EMAIL:
      return sortKeyLocale('email');
    case UserSortingTypes.SORT_ROLE:
      return sortKeyLocale((user) => RoleType[user.type]);
    case UserSortingTypes.SORT_UNRATED:
      return sortKeyNumeric((user) =>
        unratedTasksAmount(user, tasks, customers),
      );
    default:
      break;
  }
};
