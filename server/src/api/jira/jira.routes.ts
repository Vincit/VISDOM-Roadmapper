import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import { getBoards } from './jira.controller';
const jiraRouter = new KoaRouter<DefaultState, Context>();

jiraRouter.get('/jira/boards', getBoards);

export default jiraRouter;
