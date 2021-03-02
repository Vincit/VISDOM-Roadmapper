import { RouteHandlerFnc } from '../../types/customTypes';
import {
  authorizationURL,
  swapOAuthToken,
  createJiraClient,
  insertOrUpdateToken,
} from '../../utils/jiraauthentication';
import JiraConfiguration from '../jiraconfigurations/jiraconfigurations.model';
import Roadmap from '../roadmaps/roadmaps.model';
import Task from '../tasks/tasks.model';
import User from '../users/users.model';

const fetchImportUserAndRoadmap = async (
  roadmapId: number,
  userId: number,
): Promise<{
  roadmap: Roadmap;
  user: User;
}> => {
  const roadmap = await Roadmap.query()
    .withGraphFetched('[jiraconfiguration]')
    .findById(roadmapId);
  if (!roadmap || !roadmap.jiraconfiguration) {
    throw 'Missing Roadmap or JiraConfiguration.';
  }

  const user = await User.query().withGraphFetched('[tokens]').findById(userId);

  return {
    roadmap: roadmap,
    user: user,
  };
};

const jiraClientForRoadmapAndUser = async (
  roadmapId: number,
  userId: number,
) => {
  const { user, roadmap } = await fetchImportUserAndRoadmap(roadmapId, userId);
  return createJiraClient(roadmap.jiraconfiguration!, user);
};

export const getBoards: RouteHandlerFnc = async (ctx, _) => {
  const roadmapId = ctx.params.id;

  const userId = parseInt(ctx.state.user.id, 10);
  const jiraApi = await jiraClientForRoadmapAndUser(roadmapId, userId);

  const boards = await jiraApi.getAllBoards();
  ctx.body = boards.values.map((board: any) => {
    return {
      id: board.id,
      name: board.name,
    };
  });
};

const boardLabels = async (
  userId: number,
  roadmapId: number,
  boardId: string,
): Promise<string[]> => {
  const jiraApi = await jiraClientForRoadmapAndUser(roadmapId, userId);
  const boardissues = await jiraApi.getIssuesForBoard(boardId);
  const allIssues: string[] = boardissues.issues.flatMap(
    (issue: any): string[] => issue.fields.labels,
  );
  return [...new Set(allIssues)];
};

export const getBoardLabels: RouteHandlerFnc = async (ctx, _) => {
  const roadmapId = ctx.params.id;
  const boardId = ctx.params.board;
  const userId = parseInt(ctx.state.user.id, 10);
  const labels = await boardLabels(userId, roadmapId, boardId);
  ctx.body = labels;
  ctx.status = 200;
};

export const importBoard: RouteHandlerFnc = async (ctx, _) => {
  const { boardId, roadmapId, createdByUser } = ctx.request.body;

  const userId = parseInt(ctx.state.user.id, 10);
  const jiraApi = await jiraClientForRoadmapAndUser(roadmapId, userId);

  const boardissues = await jiraApi.getIssuesForBoard(boardId);
  const issues = boardissues.issues;

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

export const getOauthAuthorizationURL: RouteHandlerFnc = async (ctx, _) => {
  try {
    const jiraconfiguration = await JiraConfiguration.query().findById(
      ctx.params.id,
    );

    const oauthResponse = await authorizationURL(
      jiraconfiguration.url,
      jiraconfiguration.privatekey,
    );
    ctx.body = {
      url: oauthResponse.url,
      token: oauthResponse.token,
      tokenSecret: oauthResponse.token_secret,
    };
    ctx.status = 200;
  } catch (error) {
    ctx.body = {
      error: 'Error in getting Jira OAuth authorization URL: ' + error,
    };
    ctx.status = 500;
  }
};

export const swapOauthAuthorizationToken: RouteHandlerFnc = async (ctx, _) => {
  const { verifierToken, token, tokenSecret } = ctx.request.body;

  try {
    const jiraconfiguration = await JiraConfiguration.query().findById(
      ctx.params.id,
    );
    const oauthResponse = await swapOAuthToken(
      jiraconfiguration.url,
      jiraconfiguration.privatekey,
      token,
      tokenSecret,
      verifierToken,
    );

    if (!oauthResponse || !oauthResponse.token) {
      throw 'Empty response on authorization token swap.';
    }

    await insertOrUpdateToken({
      provider: 'jira',
      instance: jiraconfiguration.url,
      type: 'access_token',
      user: parseInt(ctx.state.user.id, 10),
      value: oauthResponse.token,
    });
    await insertOrUpdateToken({
      provider: 'jira',
      instance: jiraconfiguration.url,
      type: 'access_token_secret',
      user: parseInt(ctx.state.user.id, 10),
      value: tokenSecret,
    });

    ctx.status = 200;
    ctx.body = 'OAuth token swapped successfully.';
  } catch (error) {
    console.log('Controller error on OAuth URL creation:', error);
    ctx.status = 500;
    ctx.body = 'Exception is OAuth token swap.';
  }
};
