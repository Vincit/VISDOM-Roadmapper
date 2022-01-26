type typeValidator<T> = (value: any) => value is T;

export const isTypedArray = <T>(validateItem: typeValidator<T>) => (
  value: unknown,
): value is T[] => {
  if (!Array.isArray(value)) return false;
  return value.every(validateItem);
};

export const isNumber = (x: unknown): x is number => typeof x === 'number';
export const isNumberArray = isTypedArray(isNumber);
