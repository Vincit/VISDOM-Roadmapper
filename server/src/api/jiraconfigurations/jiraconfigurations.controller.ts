import { RouteHandlerFnc } from '../../types/customTypes';
import JiraConfiguration from './jiraconfigurations.model';

export const postJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await JiraConfiguration.query().insertAndFetch({
    ...ctx.request.body,
    roadmapId: Number(ctx.params.roadmapId),
  });
};

export const patchJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const { url, privatekey, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await JiraConfiguration.query().patchAndFetchById(
    Number(ctx.params.jiraId),
    { url: url, privatekey: privatekey },
  );

  if (!updated) {
    return void (ctx.status = 404);
  } else {
    return void (ctx.body = updated);
  }
};

export const deleteJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await JiraConfiguration.query()
    .findById(Number(ctx.params.jiraId))
    .where({ roadmapId: Number(ctx.params.roadmapId) })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
