import { RouteHandlerFnc } from '../../types/customTypes';
import JiraConfiguration from './jiraconfigurations.model';

export const postJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await JiraConfiguration.query().insertAndFetch({
    ...ctx.request.body,
    roadmapId: Number(ctx.params.roadmapId),
  });
};

export const patchJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const updated = await JiraConfiguration.query().patchAndFetchById(
    Number(ctx.params.jiraId),
    { ...ctx.request.body, roadmapId: Number(ctx.params.roadmapId) },
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const deleteJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await JiraConfiguration.query()
    .findById(Number(ctx.params.jiraId))
    .where({ roadmapId: Number(ctx.params.roadmapId) })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
