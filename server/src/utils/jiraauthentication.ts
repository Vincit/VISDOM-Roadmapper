import fs from 'fs';
import JiraClient from 'jira-connector';
import { JiraOAuthURLResponse } from '../types/jiraTypes';
import NodeRSA from 'node-rsa';

const PRIVATE_KEY_EXPORT_FORMAT = 'pkcs1';

const createJiraAuthorizationURL = async (
  host: string,
  privatekey: string,
): Promise<JiraOAuthURLResponse> => {
  const pkey = new NodeRSA();
  pkey.importKey(privatekey);

  // TODO: Replace consumer key.
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
): Promise<JiraOAuthURLResponse> => {
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
          resolve(oauth);
        }
      },
    );
  });
};

export const authorizationURL = createJiraAuthorizationURL;
export const swapOAuthToken = swapJiraOAuthToken;
