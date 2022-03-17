type typeValidator<T> = (value: any) => value is T;

export const isOptional = <T>(validateItem: typeValidator<T>) => (
  value: unknown,
): value is T | undefined => value === undefined || validateItem(value);

export const isArray = <T>(validateItem: typeValidator<T>) => (
  value: unknown,
): value is T[] => {
  if (!Array.isArray(value)) return false;
  return value.every(validateItem);
};

export const isString = (x: unknown): x is string => typeof x === 'string';
export const isNumber = (x: unknown): x is number => typeof x === 'number';

export const isRecord = <T>(
  validateItem: { [K in keyof T]: typeValidator<T[K]> },
) => (value: unknown): value is T =>
  typeof value === 'object' &&
  !!value &&
  Object.keys(validateItem).every((field) =>
    validateItem[field as keyof T]((value as any)[field]),
  );

export const isNumberArray = isArray(isNumber);
