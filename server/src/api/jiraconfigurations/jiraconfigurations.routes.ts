import KoaRouter from '@koa/router';
import {
  postJiraConfigurations,
  patchJiraConfigurations,
  deleteJiraConfigurations,
} from './jiraconfigurations.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import { DefaultState, Context } from 'koa';
import { IKoaState } from 'src/types/customTypes';
const jiraConfigurationRouter = new KoaRouter<IKoaState, Context>();

jiraConfigurationRouter.post(
  '/jiraconfigurations',
  requirePermission(Permission.JiraConfigurationEdit),
  postJiraConfigurations,
);
jiraConfigurationRouter.patch(
  '/jiraconfigurations/:jiraId',
  requirePermission(Permission.JiraConfigurationEdit),
  patchJiraConfigurations,
);
jiraConfigurationRouter.delete(
  '/jiraconfigurations/:jiraId',
  requirePermission(Permission.JiraConfigurationEdit),
  deleteJiraConfigurations,
);

export default jiraConfigurationRouter;
