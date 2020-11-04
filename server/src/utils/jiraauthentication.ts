import fs from 'fs';
import JiraClient from 'jira-connector';
import { JiraOAuthURLResponse } from '../types/jiraTypes';

const createJiraAuthorizationURL = async (): Promise<JiraOAuthURLResponse> => {
  let privateKey = fs.readFileSync(process.env.JIRA_PRIVATE_KEY_FILE!, 'utf8');

  return new Promise((resolve, reject) => {
    JiraClient.oauth_util.getAuthorizeURL(
      {
        host: process.env.JIRA_HOST!,
        oauth: {
          consumer_key: process.env.JIRA_CONSUMER_KEY!,
          private_key: privateKey,
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
  oauthToken: String,
  oauthSecret: String,
  oauthVerifier: String,
): Promise<JiraOAuthURLResponse> => {
  let privateKey = fs.readFileSync(process.env.JIRA_PRIVATE_KEY_FILE!, 'utf8');

  return new Promise((resolve, reject) => {
    JiraClient.oauth_util.swapRequestTokenWithAccessToken(
      {
        host: process.env.JIRA_HOST!,
        oauth: {
          token: oauthToken,
          token_secret: oauthSecret,
          oauth_verifier: oauthVerifier,
          consumer_key: process.env.JIRA_CONSUMER_KEY!,
          private_key: privateKey,
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
