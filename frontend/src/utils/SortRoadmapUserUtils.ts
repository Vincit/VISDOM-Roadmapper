import { RoadmapUser, Roadmap } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';
import { unratedTasksAmount } from './TaskUtils';
import { Sort, sortKeyLocale, sortKeyNumeric } from './SortUtils';

export enum UserSortingTypes {
  SORT_NAME,
  SORT_EMAIL,
  SORT_ROLE,
  SORT_UNRATED,
}

export const userSort = (roadmap?: Roadmap) => (
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
      return (
        roadmap && sortKeyNumeric((user) => unratedTasksAmount(user, roadmap))
      );
    default:
      break;
  }
};
