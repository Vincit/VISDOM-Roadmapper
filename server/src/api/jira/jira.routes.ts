import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import {
  getBoards,
  getBoardLabels,
  importBoard,
  getOauthAuthorizationURL,
  swapOauthAuthorizationToken,
} from './jira.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
const jiraRouter = new KoaRouter<DefaultState, Context>();

jiraRouter.get('/jira/boards', getBoards);
jiraRouter.get('/jira/boards/labels/:board', getBoardLabels);
jiraRouter.post(
  '/jira/importboard',
  requirePermission(Permission.TaskCreate | Permission.TaskEdit),
  importBoard,
);
jiraRouter.get('/jira/oauthauthorizationurl/:jiraId', getOauthAuthorizationURL);
jiraRouter.post('/jira/swapoauthtoken/:jiraId', swapOauthAuthorizationToken);
export default jiraRouter;
