import { RoadmapUser, Customer, Task } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';
import { unratedTasksByUserCount } from './TaskUtils';
import { SortBy, sortKeyLocale, sortKeyNumeric } from './SortUtils';

export enum UserSortingTypes {
  SORT_EMAIL,
  SORT_ROLE,
  SORT_UNRATED,
}

export const userSort = (
  roadmapId?: number | null,
  tasks?: Task[],
  customers?: Customer[],
) => (type: UserSortingTypes | undefined): SortBy<RoadmapUser> => {
  switch (type) {
    case UserSortingTypes.SORT_EMAIL:
      return sortKeyLocale('email');
    case UserSortingTypes.SORT_ROLE:
      return sortKeyLocale((user) => RoleType[user.type]);
    case UserSortingTypes.SORT_UNRATED:
      return !roadmapId || !tasks || !customers
        ? undefined
        : sortKeyNumeric((user) =>
            unratedTasksByUserCount(tasks, user, roadmapId, customers),
          );
    default:
      break;
  }
};
