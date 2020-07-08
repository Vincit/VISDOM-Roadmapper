import { PublicUser } from '../redux/roadmaps/types';

export enum SortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_VALUE,
}

export enum SortingOrders {
  ASCENDING,
  DESCENDING,
}

export const sortUsers = (
  userList: PublicUser[],
  sortingType: SortingTypes,
  sortingOrder: SortingOrders,
) => {
  const users = [...userList];
  switch (sortingType) {
    case SortingTypes.SORT_NAME:
      users.sort(
        (a, b) =>
          a.username.localeCompare(b.username) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    case SortingTypes.SORT_VALUE:
      users.sort(
        (a, b) =>
          ((a.customerValue || 0) - (b.customerValue || 0)) *
          (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
      );
      break;
    default:
      // SortingTypes.NO_SORT
      break;
  }

  return users;
};
