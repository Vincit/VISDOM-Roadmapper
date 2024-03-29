import { OAuth } from 'oauth';

import {
  ImportedTask,
  TaskFilters,
  IntegrationProvider,
  IntegrationEntry,
  IntegrationConfig,
  convertError,
} from '../integration';

const appName = 'VISDOM Roadmap tool';
const requestURL = 'https://trello.com/1/OAuthGetRequestToken';
const accessURL = 'https://trello.com/1/OAuthGetAccessToken';
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken';
const expiration = 'never';

const oauth = (key: string, secret: string) =>
  new OAuth(requestURL, accessURL, key, secret, '1.0A', '', 'HMAC-SHA1');

export const TrelloIntegration: IntegrationEntry = {
  defaultConfig: { host: 'trello.com' },
  configOptions: [
    { field: 'consumerkey' },
    { field: 'privatekey', secret: true },
  ],
  getIntegrationProvider: (config, tokens) =>
    new TrelloImporter(config, tokens),
  getOAuthProvider: (config) => ({
    instance: config.host,
    authorizationURL: () =>
      new Promise((resolve, reject) => {
        oauth(config.consumerkey, config.privatekey).getOAuthRequestToken(
          (error, token, tokenSecret) => {
            if (error) reject(error);
            else
              resolve({
                url: `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=read&expiration=${expiration}`,
                token,
                tokenSecret,
              });
          },
        );
      }),
    swapOAuthToken: ({ verifierToken, token, tokenSecret }) =>
      new Promise((resolve, reject) => {
        oauth(config.consumerkey, config.privatekey).getOAuthAccessToken(
          token,
          tokenSecret,
          verifierToken,
          (error, token) => {
            if (error) reject(error);
            else resolve({ accessToken: token });
          },
        );
      }),
  }),
};

// TODO: maybe filter out "Done" list
class TrelloImporter implements IntegrationProvider {
  private readonly accessToken: string;
  private readonly accessTokenSecret: string;
  private readonly oauth: OAuth;

  constructor(
    { consumerkey, privatekey }: IntegrationConfig,
    tokens: { accessToken: string; accessTokenSecret: string },
  ) {
    this.oauth = oauth(consumerkey, privatekey);
    this.accessToken = tokens.accessToken;
    this.accessTokenSecret = tokens.accessTokenSecret;
  }

  async boards() {
    // The trello api gives the expected format directly
    return await this.fetch<{ id: string; name: string }[]>(
      'members/me/boards?filter=members,open,organization,public,starred&fields=name',
    );
  }

  async columns(boardId: string) {
    return await this.fetch<{ id: string; name: string }[]>(
      `boards/${boardId}/lists?fields=id,name`,
    );
  }

  async labels(boardId: string) {
    const { labelNames } = await this.fetch<{
      labelNames: { [key in any]: string };
    }>(`boards/${boardId}?fields=labelNames`);
    return Object.values(labelNames).filter((name) => name);
  }

  async tasks(boardId: string, filters?: TaskFilters) {
    const response = await this.fetch<{ [key: string]: string }[]>(
      `boards/${boardId}/cards/open?fields=shortUrl,name,desc,labels,idList`,
    );
    return response.filter(this.importFilter(filters)).map(
      (card): ImportedTask => ({
        id: card.id,
        link: card.shortUrl,
        name: card.name,
        description: card.desc || 'No description',
        createdAt: this.cardIdToCreationTime(card.id),
        columnId: card.idList,
      }),
    );
  }

  private fetch<T>(resource: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.oauth.getProtectedResource(
        `https://api.trello.com/1/${resource}`,
        'GET',
        this.accessToken,
        this.accessTokenSecret,
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
    return (card: any) =>
      (card.labels || []).some(({ name }: { name: string }) =>
        include.has(name),
      );
  }

  private cardIdToCreationTime(id: string): string {
    // see: https://help.trello.com/article/759-getting-the-time-a-card-or-board-was-created
    return new Date(1000 * parseInt(id.substring(0, 8), 16)).toISOString();
  }
}
