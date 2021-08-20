/**
 * partition list based on predicate
 * @returns [matching, rest]
 */
export const partition = <T>(list: T[], predicate: (t: T) => boolean) => {
  const res: [T[], T[]] = [[], []];
  list.forEach((x) => res[predicate(x) ? 0 : 1].push(x));
  return res;
};

/**
 * move elements inplace between lists
 *
 * the elements are first removed and then added back,
 * so the destination index is the index after removal
 *
 * @param count how many elements to move
 */

export const move = (count: number = 1) =>
  ({
    from: <T>(src: T[], srcIndex: number) =>
      ({
        to: (dst: T[], dstIndex: number) => {
          dst.splice(dstIndex, 0, ...src.splice(srcIndex, count));
        },
      } as const),
  } as const);
