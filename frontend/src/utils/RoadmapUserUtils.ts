import { RoadmapUser } from '../redux/roadmaps/types';
import { RoleType } from '../redux/user/types';
import {
  SortingOrders,
  SortComparison,
  sorted,
  sortKeyLocale,
} from './SortUtils';

export { SortingOrders } from './SortUtils';

export enum UserSortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_ROLE,
}

const userCompare = (
  sortingType: UserSortingTypes,
): SortComparison<RoadmapUser> | undefined => {
  switch (sortingType) {
    case UserSortingTypes.SORT_NAME:
      return sortKeyLocale(({ username }) => username);
    case UserSortingTypes.SORT_ROLE:
      return sortKeyLocale(({ type }) => RoleType[type]);
    default:
      // SortingTypes.NO_SORT
      break;
  }
};

export const sortRoadmapUsers = (
  users: RoadmapUser[],
  type: UserSortingTypes,
  order: SortingOrders,
) => sorted(users, userCompare(type), order);
