export const difference = <T>(old: T[], updated: T[]) => {
  const oldSet = new Set(old);
  const updatedSet = new Set(updated);
  const removed = old.filter((value) => !updatedSet.has(value));
  const added = updated.filter((value) => !oldSet.has(value));
  return { removed, added };
};
