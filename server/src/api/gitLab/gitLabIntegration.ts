import { OAuth2 } from 'oauth';
import { randomBytes } from 'crypto';

import {
  ImportedTask,
  TaskFilters,
  IntegrationProvider,
  IntegrationEntry,
  IntegrationConfig,
  convertError,
} from '../integration';

const authorizePath = '/oauth/authorize';
const tokenPath = '/oauth/token';
const redirectBaseURL = `${process.env.FRONTEND_BASE_URL}/oauth/redirect`;

const redirectUri = (roadmapId: number) =>
  `${redirectBaseURL}?roadmapId=${roadmapId}&integrationName=gitLab`;

const oauth2 = (key: string, secret: string, host: string) =>
  new OAuth2(key, secret, host, authorizePath, tokenPath);

const getToken = (
  roadmapId: number,
  config: IntegrationConfig,
  code: string,
  grantType: string,
) =>
  new Promise<{ accessToken: string; refreshToken: string }>(
    (resolve, reject) => {
      oauth2(
        config.consumerkey,
        config.privatekey,
        `https://${config.host}`,
      ).getOAuthAccessToken(
        code,
        { grant_type: grantType, redirect_uri: redirectUri(roadmapId) },
        (err, accessToken, refreshToken) => {
          if (err) reject(convertError(err));
          else resolve({ accessToken, refreshToken });
        },
      );
    },
  );

export const GitLabIntegration: IntegrationEntry = {
  defaultConfig: { host: 'gitlab.com' },
  configOptions: [
    { field: 'projectId' },
    { field: 'consumerkey' },
    { field: 'privatekey', secret: true },
  ],
  getIntegrationProvider: (config, tokens) =>
    new GitLabImporter(config, tokens),
  getOAuthProvider: (config) => ({
    instance: config.host,
    authorizationURL: (roadmapId) =>
      new Promise((resolve, reject) => {
        try {
          const state = randomBytes(10).toString('hex');
          resolve({
            url: `https://${config.host}${authorizePath}?client_id=${
              config.consumerkey
            }&response_type=code&state=${state}&scope=read_api&redirect_uri=${encodeURIComponent(
              redirectUri(roadmapId),
            )}`,
            token: '',
            tokenSecret: '',
          });
        } catch (err) {
          reject(err);
        }
      }),
    swapOAuthToken: ({ verifierToken, roadmapId }) =>
      getToken(roadmapId, config, verifierToken, 'authorization_code'),
    tokenRefresh: (refreshToken, roadmapId) =>
      getToken(roadmapId, config, refreshToken, 'refresh_token'),
  }),
};

class GitLabImporter implements IntegrationProvider {
  private readonly projectId: string;
  private readonly oauth2: OAuth2;
  private readonly accessToken: string;

  constructor(
    { projectId, consumerkey, privatekey, host }: IntegrationConfig,
    tokens: { accessToken: string },
  ) {
    this.projectId = projectId || '';
    this.accessToken = tokens.accessToken;
    this.oauth2 = oauth2(consumerkey, privatekey, host);
  }

  async boards() {
    const response = await this.fetch<{ id: number; name: string }[]>('boards');
    return response.map((board) => ({
      id: `${board.id}`,
      name: board.name,
    }));
  }

  // In GitLab, columns ("lists") can only be created out of labels.
  // The columns themselves do have an id, but they are named after the label.
  // Therefore, this returns the column id and the label's name.
  async columns(boardId: string) {
    const lists = await this.fetch<{ id: number; label: { name: string } }[]>(
      `boards/${boardId}/lists`,
    );
    return lists.map((list) => ({ id: `${list.id}`, name: list.label.name }));
  }

  async labels(boardId: string) {
    const lists = await this.columns(boardId);
    return lists.map((list) => list.name);
  }

  // Inefficient, as GitLab offers no method to get tasks for a given board.
  // We have to get columns (=labels) for a board, and then get issues for the labels.
  // This also has to be done one by one, as /issues?labels= filter is AND only.
  async tasks(boardId: string, filters?: TaskFilters) {
    const boardColumns = await this.columns(boardId);

    const issues: { [key: string]: string }[] = (
      await Promise.all(
        boardColumns.map(async (column) => {
          const issuesForColumn = await this.getIssuesForLabel(column.name);
          return issuesForColumn.map((issue) => ({
            ...issue,
            columnId: column.id,
          }));
        }),
      )
    ).flat();

    return issues.filter(this.importFilter(filters)).map(
      (issue): ImportedTask => ({
        id: `${issue.id}`,
        link: issue.web_url,
        name: issue.title,
        description: issue.description || 'No description',
        createdAt: issue.created_at,
        columnId: `${issue.columnId}`,
      }),
    );
  }

  private fetch<T>(resource: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.oauth2.get(
        `https://gitlab.com/api/v4/projects/${this.projectId}/${resource}`,
        this.accessToken,
        (err, result) => {
          if (!err) resolve(JSON.parse(result as string));
          else reject(convertError(err));
        },
      );
    });
  }

  private importFilter(filters?: TaskFilters) {
    const include = new Set(filters?.labels || []);
    if (include.size === 0) return () => true;
    return (issue: any) =>
      (issue.labels || []).some((label: string) => include.has(label));
  }

  private async getIssuesForLabel(labelName: string) {
    return await this.fetch<{ [key: string]: string }[]>(
      `issues?labels=${labelName.replace(/ /g, '+')}`,
    );
  }
}
