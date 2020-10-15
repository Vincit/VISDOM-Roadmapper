import { RouteHandlerFnc } from '../../types/customTypes';
import { jiraApi } from '../../utils/jiraclient';
import Task from '../tasks/tasks.model';

export const getBoards: RouteHandlerFnc = async (ctx, _) => {
  const boards = await jiraApi.getAllBoards();
  ctx.body = boards.values.map((board: any) => {
    return {
      id: board.id,
      name: board.name,
    };
  });
};

export const importBoard: RouteHandlerFnc = async (ctx, _) => {
  const { boardId, roadmapId, createdByUser } = ctx.request.body;
  const boardissues = await jiraApi.getIssuesForBoard(boardId);
  const issueIds = boardissues.issues.map((issue: any) => issue.id);
  const issues = await Promise.all(
    issueIds.map(async (id: any) => await jiraApi.findIssue(id)),
  );
  const importedTasks: Task[] = [];
  for (let issue of issues) {
    const convertedIssue = issue as any;
    const task = {
      name: convertedIssue.fields.summary,
      description: convertedIssue.fields.description || 'No description',
      createdAt: convertedIssue.fields.created,
      completed: false,
      jiraId: parseInt(convertedIssue.id, 10),
      createdByUser: createdByUser,
      roadmapId: roadmapId,
    };
    const existing = await Task.query()
      .where('jiraId', parseInt(convertedIssue.id, 10))
      .first();
    if (existing) {
      const imported = await Task.query().patchAndFetchById(existing.id, task);
      importedTasks.push(imported);
    } else {
      const imported = await Task.query().insert(task);
      importedTasks.push(imported);
    }
  }

  ctx.body = importedTasks.length + ' tasks imported';
  ctx.status = 200;
};
