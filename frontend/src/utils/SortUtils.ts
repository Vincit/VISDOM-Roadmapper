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

const reverse = <T>(cmp: Comparison<T>): Comparison<T> => (a, b) =>
  cmp(a, b) * -1;

const sortKeyCompare = <K>(compare: Comparison<K>) => <T>(
  key: Key<T, K>,
  options?: Partial<{ reverse: boolean }>,
): SortBy<T, K> => ({
  key,
  compare: options?.reverse ? reverse(compare) : compare,
});

export const sortKeyNumeric = sortKeyCompare<number>((a, b) => a - b);

export const sortKeyBoolean = sortKeyCompare<boolean>(
  (a, b) => Number(a) - Number(b),
);

export const sortKeyLocale = sortKeyCompare<string>((a, b) =>
  a.localeCompare(b),
);

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

export const useSorting = <SortingType, ItemType, Default extends SortingType>(
  getSort: (t: SortingType | undefined) => SortBy<ItemType>,
  defaultType?: Default,
) => {
  const [type, setType] = useState<SortingType | undefined>(defaultType);
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
