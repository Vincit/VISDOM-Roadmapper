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
      let message = '';
      let errorCount = 0;
      for (let column of Object.keys(err.data)) {
        for (let columnErr of err.data[column]) {
          if (errorCount > 0) message += '\n';
          message += `"${column}" ` + columnErr.message;
          errorCount += 1;
        }
      }

      ctx.status = 400;
      ctx.body = {
        error: 'ValidationError',
        message: message,
      };
    } else if (err instanceof UniqueViolationError) {
      let message = '';
      let errorCount = 0;
      for (let column of err.columns) {
        if (errorCount > 0) message += '\n';
        message += `"${column}" must be unique.`;
        errorCount += 1;
      }

      ctx.status = 400;
      ctx.body = {
        error: 'UniqueViolationError',
        message: message,
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
        message: err.column + ' is required',
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
