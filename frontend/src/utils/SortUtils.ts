export enum SortingOrders {
  ASCENDING = 1,
  DESCENDING = -1,
}

export type SortKey<T, K> = (value: T) => K;
export type SortComparison<T> = (a: T, b: T) => number;

export const sortKeyCompare = <T, K>(
  key: SortKey<T, K>,
  compare: SortComparison<K>,
): SortComparison<T> => (a: T, b: T) => compare(key(a), key(b));

export const sortKeyNumeric = <T>(key: SortKey<T, number>) =>
  sortKeyCompare(key, (a, b) => a - b);

export const sortKeyLocale = <T>(key: SortKey<T, string>) =>
  sortKeyCompare(key, (a, b) => a.localeCompare(b));

export const sorted = <T>(
  list: T[],
  compare?: SortComparison<T>,
  order: SortingOrders = SortingOrders.ASCENDING,
) =>
  compare === undefined
    ? list
    : [...list].sort((a, b) => compare(a, b) * order);
