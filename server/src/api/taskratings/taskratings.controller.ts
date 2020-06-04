import { RouteHandlerFnc } from '../../types/customTypes';
import Taskrating from './taskratings.model';

export const getTaskratings: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Taskrating.query().withGraphFetched('[createdBy]');
  } else {
    ctx.body = await Taskrating.query();
  }
};

export const postTaskratings: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await Taskrating.query().insert(ctx.request.body);
};

export const deleteTaskratings: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Taskrating.query().findById(ctx.params.id).delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTaskratings: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Taskrating.query().patchAndFetchById(
    ctx.params.id,
    ctx.request.body,
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
