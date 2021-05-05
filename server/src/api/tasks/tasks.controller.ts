import { RouteHandlerFnc } from '../../types/customTypes';
import Task from './tasks.model';
import Objection from 'objection';

export const getTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Task.query().withGraphFetched('[ratings, createdBy]');
  } else {
    ctx.body = await Task.query()
      .withGraphFetched('[ratings(selectRatingId), createdBy(selectUserId)]')
      .modifiers({
        selectRatingId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('taskratings.id');
        },
        selectUserId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('users.id');
        },
      });
  }
};

export const postTasks: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await Task.query().insertAndFetch(ctx.request.body);
};

export const deleteTasks: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Task.query().findById(ctx.params.id).delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTasks: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Task.query().patchAndFetchById(
    ctx.params.id,
    ctx.request.body,
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const postTasksRatings: RouteHandlerFnc = async (ctx, _) => {
  const child = await Task.relatedQuery('ratings')
    .for(ctx.params.id)
    .insertAndFetch(ctx.request.body);

  ctx.body = child;
};
