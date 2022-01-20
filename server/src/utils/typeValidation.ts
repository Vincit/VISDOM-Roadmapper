type typeValidator<T> = (value: any) => value is T;

export const isTypedArray = <T>(validateItem: typeValidator<T>) => (
  value: any,
): value is T[] => {
  if (!Array.isArray(value)) return false;
  return value.every(validateItem);
};

export const isNumberArray = isTypedArray(
  (x): x is number => typeof x === 'number',
);
