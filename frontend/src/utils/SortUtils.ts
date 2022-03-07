import { useState, useMemo } from 'react';

export enum SortingOrders {
  ASCENDING = 1,
  DESCENDING = -1,
}

// from: https://stackoverflow.com/a/52991061
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// The type doesn't play nice with optional properties,
// so those are just not allowed.
// If optional property is needed for sorting, the key must be a function
type PropertyKey<T, K> = {
  [P in keyof T]: T[P] extends K ? P : never;
}[RequiredKeys<T>];

type Key<T, K> = PropertyKey<T, K> | ((value: T) => K);

type Comparison<T> = (a: T, b: T) => number;

export type SortBy<T, K = any> =
  | undefined
  | {
      key: Key<T, K>;
      compare: Comparison<K>;
    }
  | { compare: Comparison<T> };

const sortKeyCompare = <T, K>(
  key: Key<T, K>,
  compare: Comparison<K>,
): SortBy<T, K> => ({ key, compare });

export const sortKeyNumeric = <T>(key: Key<T, number>) =>
  sortKeyCompare(key, (a, b) => a - b);

export const sortKeyBoolean = <T>(key: Key<T, boolean>) =>
  sortKeyCompare(key, (a, b) => Number(a) - Number(b));

export const sortKeyLocale = <T>(key: Key<T, string>) =>
  sortKeyCompare(key, (a, b) => a.localeCompare(b));

export const sort = <T, K>(
  by: SortBy<T, K>,
  order: SortingOrders = SortingOrders.ASCENDING,
) => {
  // no sorting
  if (!by) return (list: T[]) => list;

  if ('key' in by) {
    const { key, compare } = by;
    if (typeof key === 'function') {
      // use decorate-sort-undecorate pattern for calculated keys
      return (list: T[]) =>
        list
          .map((t) => ({ key: key(t), item: t }))
          .sort((a, b) => compare(a.key, b.key) * order)
          .map(({ item }) => item);
    }

    // sort by direct property of the object
    return (list: T[]) =>
      [...list].sort(
        (a, b) =>
          compare((a[key] as unknown) as K, (b[key] as unknown) as K) * order,
      );
  }

  // sort by comparison function
  return (list: T[]) => [...list].sort((a, b) => by.compare(a, b) * order);
};

export const useSorting = <SortingType, ItemType>(
  getSort: (t: SortingType | undefined) => SortBy<ItemType>,
) => {
  const [type, setType] = useState<SortingType | undefined>();
  const [order, setOrder] = useState(SortingOrders.ASCENDING);
  return [
    useMemo(() => sort(getSort(type), order), [getSort, order, type]),
    {
      type: {
        get: () => type,
        set: setType,
      },
      order: {
        get: () => order,
        toggle: () => setOrder((prev) => prev * -1),
        reset: () => setOrder(SortingOrders.ASCENDING),
      },
    },
  ] as const;
};
