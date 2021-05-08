import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import {
  postJiraConfigurations,
  patchJiraConfigurations,
  deleteJiraConfigurations,
} from './jiraconfigurations.controller';
import { DefaultState, Context } from 'koa';
const jiraConfigurationRouter = new KoaRouter<DefaultState, Context>();

jiraConfigurationRouter.post(
  '/jiraconfigurations',
  requireAuth,
  postJiraConfigurations,
);
jiraConfigurationRouter.patch(
  '/jiraconfigurations/:jiraId',
  requireAuth,
  patchJiraConfigurations,
);
jiraConfigurationRouter.delete(
  '/jiraconfigurations/:jiraId',
  requireAuth,
  deleteJiraConfigurations,
);

export default jiraConfigurationRouter;
