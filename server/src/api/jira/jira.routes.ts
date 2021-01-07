import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import { getBoards, importBoard } from './jira.controller';
const jiraRouter = new KoaRouter<DefaultState, Context>();

jiraRouter.get('/jira/boards', requireAuth, getBoards);
jiraRouter.post('/jira/importboard', requireAuth, importBoard);
export default jiraRouter;
