import { Context } from 'koa';
import {
  ValidationError,
  ErrorHash,
  UniqueViolationError,
  ForeignKeyViolationError,
  NotNullViolationError,
} from 'objection';
import { ForbiddenError } from './checkPermissions';

export const errorHandler = async (ctx: Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ValidationError) {
      const columns = Object.entries(err.data as ErrorHash).flatMap(
        ([column, errors]) =>
          errors.map(({ message }) => ({
            column,
            message,
          })),
      );
      const message = columns
        .map(({ column, message }) => `"${column}" ${message}`)
        .join('\n');

      ctx.status = 400;
      ctx.body = {
        error: 'ValidationError',
        message,
        columns,
      };
    } else if (err instanceof UniqueViolationError) {
      const errors = err.columns.map((column) => `"${column}" must be unique.`);

      ctx.status = 400;
      ctx.body = {
        error: 'UniqueViolationError',
        message: errors.join('\n'),
        columns: err.columns,
      };
    } else if (err instanceof SyntaxError) {
      ctx.status = 400;
      ctx.body = {
        error: 'SyntaxError',
        message: err.message,
      };
    } else if (err instanceof ForeignKeyViolationError) {
      ctx.status = 400;
      ctx.body = {
        error: 'ForeignKeyViolationError',
        message: err.message,
      };
    } else if (err instanceof NotNullViolationError) {
      ctx.status = 400;
      ctx.body = {
        error: 'NotNullViolationError',
        message: `${err.column} is required`,
      };
    } else if (err instanceof ForbiddenError) {
      ctx.status = 403;
      ctx.body = err.message;
    } else {
      console.log(err);

      ctx.status = 500;
      ctx.body = {
        error: 'InternalServerError',
        errors: err.message,
      };
    }
  }
};
