import { Context } from 'koa';
import {
  ValidationError,
  UniqueViolationError,
  ForeignKeyViolationError,
  NotNullViolationError,
} from 'objection';

export const errorHandler = async (ctx: Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ValidationError) {
      const errors = [];
      for (let column of Object.keys(err.data)) {
        for (let columnErr of err.data[column]) {
          errors.push(`"${column}" ${columnErr.message}`);
        }
      }

      ctx.status = 400;
      ctx.body = {
        error: 'ValidationError',
        message: errors.join('\n'),
      };
    } else if (err instanceof UniqueViolationError) {
      const errors = err.columns.map((column) => `"${column}" must be unique.`);

      ctx.status = 400;
      ctx.body = {
        error: 'UniqueViolationError',
        message: errors.join('\n'),
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
