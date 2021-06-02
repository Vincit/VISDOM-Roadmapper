import KoaRouter from '@koa/router';
import { Context } from 'koa';
import {
  getBoards,
  getBoardLabels,
  importBoard,
  getOauthAuthorizationURL,
  swapOauthAuthorizationToken,
} from './jira.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../../../shared/types/customTypes';
import { IKoaState } from '../../types/customTypes';

const jiraRouter = new KoaRouter<IKoaState, Context>();

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
