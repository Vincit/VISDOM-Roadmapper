import { RoleType } from '../../../shared/types/customTypes';

export const titleCase = (s: string): string =>
  s.substr(0, 1).toLocaleUpperCase() + s.substr(1);

export const percent = (maximumFractionDigits?: number) =>
  new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits });

export const getRoleType = (role: string) => {
  if (role === 'Developer') return RoleType.Developer;
  if (role === 'Business') return RoleType.Business;
  if (role === 'Admin') return RoleType.Admin;
};
