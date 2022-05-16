import { OAuth2 } from 'oauth';
import { randomBytes } from 'crypto';

import {
  ImportedTask,
  TaskFilters,
  IntegrationProvider,
  IntegrationEntry,
  IntegrationConfig,
  InvalidTokenError,
} from '../integration';

const authorizePath = '/oauth/authorize';
const tokenPath = '/oauth/token';
const redirectBaseURL = `${process.env.FRONTEND_BASE_URL}/oauth/redirect`;

const oauth2 = (key: string, secret: string, host: string) =>
  new OAuth2(key, secret, host, authorizePath, tokenPath);

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
        const state = randomBytes(10).toString('hex');

        const redirectUri = encodeURIComponent(
          `${redirectBaseURL}?roadmapId=${roadmapId}&integrationName=gitLab`,
        );
        resolve({
          url: `https://${config.host}${authorizePath}?client_id=${config.consumerkey}&response_type=code&state=${state}&scope=read_api&redirect_uri=${redirectUri}`,
          token: '',
          tokenSecret: '',
        });
      }),
    swapOAuthToken: ({ verifierToken, token, tokenSecret, roadmapId }) =>
      new Promise((resolve, reject) => {
        const redirectUri = `${redirectBaseURL}?roadmapId=${roadmapId}&integrationName=gitLab`;

        oauth2(
          config.consumerkey,
          config.privatekey,
          `https://${config.host}`,
        ).getOAuthAccessToken(
          verifierToken,
          {
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          },
          (err, access_token, refresh_token, result) => {
            if (err) reject(err);
            else
              resolve({
                accessToken: access_token,
                refreshToken: refresh_token,
              });
          },
        );
      }),
  }),
};

class GitLabImporter implements IntegrationProvider {
  private readonly projectId: string;
  private readonly oauth2: OAuth2;
  private readonly accessToken: string;
  private lastUsedRedirectUri: string;

  constructor(
    { projectId, consumerkey, privatekey, host }: IntegrationConfig,
    tokens: { accessToken: string },
  ) {
    this.projectId = projectId || '';
    this.lastUsedRedirectUri = '';
    this.accessToken = tokens.accessToken;
    this.oauth2 = oauth2(consumerkey, privatekey, host);
  }

  setLastUsedRedirectUri(uri: string) {
    this.lastUsedRedirectUri = uri;
  }
  getLastUsedRedirectUri() {
    return this.lastUsedRedirectUri;
  }

  async boards() {
    const response = await this.fetch<{ id: number; name: string }[]>('boards');
    return (response as any[]).map((board) => ({
      id: `${board.id}`,
      name: board.name,
    }));
  }

  // In GitLab, columns ("lists") can only be created out of labels.
  // The columns themselves do have an id, but they are named after the label.
  // Therefore, this returns the column id and the label's name.
  async columns(boardId: string) {
    const lists = await this.fetch<
      Array<{ id: number; label: { name: string } }>
    >(`boards/${boardId}/lists`);
    return lists.map((list) => ({ id: `${list.id}`, name: list.label.name }));
  }

  async labels(boardId: string) {
    const lists = await this.fetch<Array<{ label: { name: string } }>>(
      `boards/${boardId}/lists`,
    );
    return lists.map((list) => list.label.name);
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
          if (!err) return resolve(JSON.parse(result as string));
          if (err.statusCode === 401 && /token/i.test(err.data))
            reject(new InvalidTokenError(err.data));
          else reject(err);
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
