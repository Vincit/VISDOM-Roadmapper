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

const appName = 'VISDOM Roadmap tool';
const authorizeURL = 'https://gitlab.com/oauth/authorize';
const tokenURL = 'https://gitlab.com/oauth/token';
const redirectURL = '';
const expiration = '30days';

const oauth2 = (key: string, secret: string, host: string) =>
  new OAuth2(key, secret, host, authorizeURL, tokenURL);

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
    authorizationURL: () =>
      new Promise((resolve, reject) => {
        const state = randomBytes(10).toString('hex');
        const redirectURL = '';
        resolve({
          url: `${authorizeURL}?client_id=${config.consumerkey}&response_type=code&state=${state}&scope=read_api&redirect_uri=https://localhost:3000`,
          token: '',
          tokenSecret: '',
        });
      }),
    swapOAuthToken: ({ verifierToken, token, tokenSecret }) =>
      new Promise((resolve, reject) => {
        oauth2(
          config.consumerkey,
          config.privatekey,
          config.host,
        ).getOAuthAccessToken(
          verifierToken,
          (err, access_token, refresh_token, result) => {
            if (err) reject(err);
            else resolve(access_token);
          },
        );
      }),
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
    return await this.fetch<{ id: string; name: string }[]>('boards');
  }

  // In GitLab, columns ("lists") can only be created out of labels.
  // The columns themselves do have an id, but they are named after the label.
  // Therefore, this returns the column id and the label's name.
  async columns(boardId: string) {
    const lists = await this.fetch<
      Array<{ id: string; label: { name: string } }>
    >(`boards/${boardId}/lists`);
    return lists.map((list) => ({ id: list.id, name: list.label.name }));
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
  async tasks(boardId: string) {
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

    return issues.map(
      (card): ImportedTask => ({
        id: card.id,
        link: card.web_url,
        name: card.title,
        description: card.description || 'No description',
        createdAt: card.created_at,
        columnId: card.columnId,
      }),
    );
  }

  private fetch<T>(resource: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.oauth2.getProtectedResource(
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

  private async getIssuesForLabel(labelName: string) {
    return await this.fetch<{ [key: string]: string }[]>(
      `issues?labels=${labelName.replaceAll(' ', '+')}`,
    );
  }
}
