import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import {
  getBoards,
  importBoard,
  getOauthAuthorizationURL,
  swapOauthAuthorizationToken,
} from './jira.controller';
const jiraRouter = new KoaRouter<DefaultState, Context>();

jiraRouter.get('/jira/boards/:id', getBoards);
jiraRouter.post('/jira/importboard', importBoard);
jiraRouter.get('/jira/oauthauthorizationurl/:id', getOauthAuthorizationURL);
jiraRouter.post('/jira/swapoauthtoken/:id', swapOauthAuthorizationToken);
export default jiraRouter;
