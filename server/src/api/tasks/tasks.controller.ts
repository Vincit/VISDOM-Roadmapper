import { RouteHandlerFnc } from '../../types/customTypes';
import Task from './tasks.model';
import Objection from 'objection';

export const getTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Task.query().withGraphFetched(
      '[ratings, relatedTasks, createdBy]',
    );
  } else {
    ctx.body = await Task.query()
      .withGraphFetched(
        '[ratings(selectRatingId), relatedTasks(selectTaskId), createdBy(selectUserId)]',
      )
      .modifiers({
        selectTaskId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('tasks.id');
        },
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

export const postTasksRelatedtasks: RouteHandlerFnc = async (ctx, _) => {
  //Add relation to an existing task to this tasks "Related tasks".
  const ids = ctx.request.body.ids || ctx.request.body.id;
  const numUpdated = await Task.relatedQuery('relatedTasks')
    .for(ctx.params.id)
    .relate(ids);

  if (numUpdated == 1) {
    const relatedTasks = await Task.relatedQuery('relatedTasks')
      .for(ctx.params.id)
      .select('tasks.id');
    ctx.body = relatedTasks;
  } else {
    ctx.status = 404;
  }
};

export const getTasksRelatedTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    const relatedTasks = await Task.relatedQuery('relatedTasks').for(
      ctx.params.id,
    );
    ctx.body = relatedTasks;
  } else {
    const relatedTasks = await Task.relatedQuery('relatedTasks')
      .for(ctx.params.id)
      .select('tasks.id');
    ctx.body = relatedTasks;
  }
};
