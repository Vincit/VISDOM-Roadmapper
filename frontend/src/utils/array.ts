/**
 * partition list based on predicate
 * @returns [matching, rest]
 */
export const partition = <T>(list: T[], predicate: (t: T) => boolean) => {
  const res: [T[], T[]] = [[], []];
  list.forEach((x) => res[predicate(x) ? 0 : 1].push(x));
  return res;
};
