import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import { getBoards, importBoard } from './jira.controller';
const jiraRouter = new KoaRouter<DefaultState, Context>();

jiraRouter.get('/jira/boards', getBoards);
jiraRouter.post('/jira/importboard', importBoard);
export default jiraRouter;
