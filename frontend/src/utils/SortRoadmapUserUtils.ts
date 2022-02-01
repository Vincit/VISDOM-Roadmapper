import { RoadmapUser, Customer, Task } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';
import { unratedTasksAmount } from './TaskUtils';
import { SortBy, sortKeyLocale, sortKeyNumeric } from './SortUtils';

export enum UserSortingTypes {
  SORT_EMAIL,
  SORT_ROLE,
  SORT_UNRATED,
}

export const userSort = (
  roadmapId?: number,
  tasks?: Task[],
  users?: RoadmapUser[],
  customers?: Customer[],
) => (type: UserSortingTypes | undefined): SortBy<RoadmapUser> => {
  switch (type) {
    case UserSortingTypes.SORT_EMAIL:
      return sortKeyLocale('email');
    case UserSortingTypes.SORT_ROLE:
      return sortKeyLocale((user) => RoleType[user.type]);
    case UserSortingTypes.SORT_UNRATED:
      return roadmapId === undefined
        ? undefined
        : sortKeyNumeric((user) =>
            unratedTasksAmount(user, roadmapId, tasks ?? [], users, customers),
          );
    default:
      break;
  }
};
