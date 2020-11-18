import KoaRouter from '@koa/router';
import {
  postJiraConfigurations,
  patchJiraConfigurations,
  deleteJiraConfigurations,
} from './jiraconfigurations.controller';
import { DefaultState, Context } from 'koa';
const jiraConfigurationRouter = new KoaRouter<DefaultState, Context>();

jiraConfigurationRouter.post('/jiraconfigurations', postJiraConfigurations);
jiraConfigurationRouter.patch('/jiraconfigurations/:id', patchJiraConfigurations);
jiraConfigurationRouter.delete('/jiraconfigurations/:id', deleteJiraConfigurations);

export default jiraConfigurationRouter;
