import { RouteHandlerFnc } from '../../types/customTypes';
import JiraConfiguration from './jiraconfigurations.model';

export const postJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await JiraConfiguration.query().insertAndFetch(ctx.request.body);
};

export const patchJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const updated = await JiraConfiguration.query().patchAndFetchById(
    ctx.params.id,
    ctx.request.body,
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const deleteJiraConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await JiraConfiguration.query()
    .findById(ctx.params.id)
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
