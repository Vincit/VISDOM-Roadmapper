import NodeRSA from 'node-rsa';
import JiraApi from 'jira-client';
import JiraClient from 'jira-connector';

import {
  ImportedTask,
  TaskFilters,
  IntegrationProvider,
  IntegrationEntry,
  IntegrationConfig,
  convertError,
} from '../integration';

const PRIVATE_KEY_EXPORT_FORMAT = 'pkcs1';

const exportKey = (privatekey: string) =>
  new NodeRSA().importKey(privatekey).exportKey(PRIVATE_KEY_EXPORT_FORMAT);

export const JiraIntegration: IntegrationEntry = {
  configOptions: [
    { field: 'host' },
    { field: 'consumerkey' },
    { field: 'privatekey', secret: true },
  ],
  getIntegrationProvider: (config, tokens) => new JiraImporter(config, tokens),
  getOAuthProvider: ({ host, consumerkey, privatekey }) => ({
    instance: host,
    authorizationURL: async () => {
      return new Promise((resolve, reject) => {
        JiraClient.oauth_util.getAuthorizeURL(
          {
            host,
            oauth: {
              consumer_key: consumerkey,
              private_key: exportKey(privatekey),
            },
          },
          function (error: any, oauth: any) {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: oauth.url as string,
                token: oauth.token as string,
                tokenSecret: oauth.token_secret as string,
              });
            }
          },
        );
      });
    },
    swapOAuthToken: async ({ verifierToken, token, tokenSecret }) => {
      return new Promise((resolve, reject) => {
        JiraClient.oauth_util.swapRequestTokenWithAccessToken(
          {
            host,
            oauth: {
              token,
              token_secret: tokenSecret,
              oauth_verifier: verifierToken,
              consumer_key: consumerkey,
              private_key: exportKey(privatekey),
            },
          },
          function (error: any, oauth: any) {
            if (error) {
              reject(error);
            } else {
              resolve({ accessToken: oauth as string });
            }
          },
        );
      });
    },
  }),
};

class JiraImporter implements IntegrationProvider {
  private readonly api: JiraApi;

  constructor(
    { host, consumerkey, privatekey }: IntegrationConfig,
    tokens: { accessToken: string; accessTokenSecret: string },
  ) {
    this.api = new JiraApi({
      protocol: 'https',
      host,
      apiVersion: '2',
      strictSSL: true,
      oauth: {
        consumer_key: consumerkey,
        consumer_secret: exportKey(privatekey),
        access_token: tokens.accessToken,
        access_token_secret: tokens.accessTokenSecret,
      },
    });
  }

  async boards() {
    const response = await this.api.getAllBoards().catch(this.errorHandler);
    return (response.values as any[]).map((board) => ({
      id: `${board.id}`,
      name: board.name as string,
    }));
  }

  async columns(boardId: string) {
    // A column may have multiple statuses mapped to it, and the status id
    // is available in the task, so the status is used instead of columns.
    //
    // The statuses are mapped to the corresponding column names, and
    // disambiguated by including the status name in parentheses if it
    // differs from the column name.
    const statusNames = new Map<string, string>();
    const statuses = (await this.api.listStatus()) as any[];
    statuses.forEach(({ id, name }) => statusNames.set(id, name));
    const response = await this.api.getConfiguration(boardId);
    return (response.columnConfig.columns as any[]).flatMap(
      ({ name, statuses }: { name: string; statuses: any[] }) =>
        statuses.map(({ id }) => {
          const statusName = statusNames.get(id);
          return statusName && statusName !== name
            ? { id, name: `${name} (${statusName})` }
            : { id, name };
        }),
    );
  }

  async labels(boardId: string) {
    const response = await this.api
      .getIssuesForBoard(boardId)
      .catch(this.errorHandler);
    const labels: string[] = response.issues.flatMap(
      (issue: any): string[] => issue.fields.labels,
    );
    return [...new Set(labels)];
  }

  async tasks(boardId: string, filters?: TaskFilters) {
    const boardissues = await this.api
      .getIssuesForBoard(boardId)
      .catch(this.errorHandler);
    const tasks = (boardissues.issues as any[])
      .filter(this.importFilter(filters))
      .map(
        (issue: any): ImportedTask => ({
          id: issue.id,
          link: issue.url,
          name: issue.fields.summary,
          description: issue.fields.description || 'No description',
          createdAt: issue.fields.created,
          columnId: issue.fields.status.id,
        }),
      );
    return tasks;
  }

  private importFilter(filters?: TaskFilters) {
    const include = new Set(filters?.labels || []);
    if (include.size === 0) return () => true;
    return (issue: any) =>
      (issue.fields.labels || []).some((label: string) => include.has(label));
  }

  private errorHandler(err: any): never {
    throw convertError(err);
  }
}
