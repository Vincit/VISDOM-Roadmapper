import JiraClient from 'jira-connector';
import {
  JiraOAuthURLResponse,
  JiraOAuthRequestTokenResponse,
} from '../types/jiraTypes';
import NodeRSA from 'node-rsa';
import JiraConfiguration from '../api/jiraconfigurations/jiraconfigurations.model';
import User from '../api/users/users.model';
import JiraApi from 'jira-client';
import Token from '../api/tokens/tokens.model';

const PRIVATE_KEY_EXPORT_FORMAT = 'pkcs1';

const createJiraAuthorizationURL = async (
  host: string,
  privatekey: string,
): Promise<JiraOAuthURLResponse> => {
  const pkey = new NodeRSA();
  pkey.importKey(privatekey);

  // TODO: Replace consumer key?
  return new Promise((resolve, reject) => {
    JiraClient.oauth_util.getAuthorizeURL(
      {
        host: host,
        oauth: {
          consumer_key: process.env.JIRA_CONSUMER_KEY!,
          private_key: pkey.exportKey(PRIVATE_KEY_EXPORT_FORMAT),
        },
      },
      function (error: any, oauth: any) {
        if (error) {
          reject(error);
        } else {
          resolve(oauth);
        }
      },
    );
  });
};

const swapJiraOAuthToken = async (
  host: string,
  privatekey: string,
  oauthToken: string,
  oauthSecret: string,
  oauthVerifier: string,
): Promise<JiraOAuthRequestTokenResponse> => {
  const pkey = new NodeRSA();
  pkey.importKey(privatekey);

  return new Promise((resolve, reject) => {
    JiraClient.oauth_util.swapRequestTokenWithAccessToken(
      {
        host: host,
        oauth: {
          token: oauthToken,
          token_secret: oauthSecret,
          oauth_verifier: oauthVerifier,
          consumer_key: process.env.JIRA_CONSUMER_KEY!,
          private_key: pkey.exportKey(PRIVATE_KEY_EXPORT_FORMAT),
        },
      },
      function (error: any, oauth: any) {
        if (error) {
          reject(error);
        } else {
          resolve({
            token: oauth,
          });
        }
      },
    );
  });
};

// TODO: Figure out a better way to implement this.
const getJiraAccessTokens = (
  jiraconfig: JiraConfiguration,
  user: User,
): {
  accessToken: string | undefined;
  accessTokenSecret: string | undefined;
} => {
  const requestToken = user.tokens.find((token) => {
    return (
      token.provider === 'jira' &&
      token.type === 'access_token' &&
      token.instance === jiraconfig.url
    );
  });
  const requestTokenSecret = user.tokens.find((token) => {
    return (
      token.provider === 'jira' &&
      token.type === 'access_token_secret' &&
      token.instance === jiraconfig.url
    );
  });
  return {
    accessToken: requestToken?.value,
    accessTokenSecret: requestTokenSecret?.value,
  };
};

const createClient = (jiraconfig: JiraConfiguration, user: User): JiraApi => {
  const { accessToken, accessTokenSecret } = getJiraAccessTokens(
    jiraconfig,
    user,
  );

  const pkey = new NodeRSA();
  pkey.importKey(jiraconfig.privatekey);

  return new JiraApi({
    protocol: 'https',
    host: jiraconfig.url,
    apiVersion: '2',
    strictSSL: true,
    oauth: {
      consumer_key: 'roadmapper',
      consumer_secret: pkey.exportKey(PRIVATE_KEY_EXPORT_FORMAT),
      access_token: accessToken || '',
      access_token_secret: accessTokenSecret || '',
    },
  });
};

// TODO: interface, class or something else to represent the token contents.
const upsertToken = async (newToken: {
  provider: string;
  instance: string;
  type: string;
  user: number;
  value: string;
}) => {
  // TODO: Extract providers and token types somewhere to avoid magic numbers.
  const existing = await Token.query()
    .where('tokens.user', newToken.user)
    .where('provider', newToken.provider)
    .where('instance', newToken.instance)
    .where('type', newToken.type)
    .first();
  if (existing) {
    await Token.query().patchAndFetchById(existing.id, newToken);
  } else {
    await Token.query().insert(newToken);
  }
};

export const authorizationURL = createJiraAuthorizationURL;
export const swapOAuthToken = swapJiraOAuthToken;
export const createJiraClient = createClient;
export const insertOrUpdateToken = upsertToken;
