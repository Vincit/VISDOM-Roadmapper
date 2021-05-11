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
const jiraRouter = new KoaRouter<DefaultState, Context>();

jiraRouter.get('/jira/boards', getBoards);
jiraRouter.get('/jira/boards/labels/:board', getBoardLabels);
jiraRouter.post('/jira/importboard', importBoard);
jiraRouter.get('/jira/oauthauthorizationurl/:jiraId', getOauthAuthorizationURL);
jiraRouter.post('/jira/swapoauthtoken/:jiraId', swapOauthAuthorizationToken);
export default jiraRouter;
