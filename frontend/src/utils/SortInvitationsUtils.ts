import { Invitation } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';

import { SortBy, sortKeyLocale, sortKeyBoolean } from './SortUtils';

export enum InvitationSortingTypes {
  SORT_ROLE,
  SORT_EMAIL,
  SORT_DATE,
  SORT_VALID,
}

export const invitationSort = () => (
  type: InvitationSortingTypes | undefined,
): SortBy<Invitation> => {
  switch (type) {
    case InvitationSortingTypes.SORT_ROLE:
      return sortKeyLocale((user) => RoleType[user.type]);
    case InvitationSortingTypes.SORT_EMAIL:
      return sortKeyLocale('email');
    case InvitationSortingTypes.SORT_DATE:
      return sortKeyLocale('updatedAt');
    case InvitationSortingTypes.SORT_VALID:
      return sortKeyBoolean('valid');
    default:
      break;
  }
};
