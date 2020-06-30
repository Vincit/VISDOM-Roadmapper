import { RouteHandlerFnc } from 'src/types/customTypes';
import Version from './versions.model';

export const getVersions: RouteHandlerFnc = async (ctx, _) => {
  const tasks = await Version.query();
  ctx.body = tasks;
};

export const postVersions: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await Version.query().insertAndFetch(ctx.request.body);
};

export const deleteVersions: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Version.query().findById(ctx.params.id).delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchVersions: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Version.query().patchAndFetchById(
    ctx.params.id,
    ctx.request.body,
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
