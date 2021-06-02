import KoaRouter from '@koa/router';
import {
  postJiraConfigurations,
  patchJiraConfigurations,
  deleteJiraConfigurations,
} from './jiraconfigurations.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaState } from '../../types/customTypes';
import { Context } from 'koa';
import { Permission } from '../../../../shared/types/customTypes';

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
