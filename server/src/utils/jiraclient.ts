import fs from 'fs';
import JiraApi from 'jira-client';

const JIRA_PRIVATEKEY =
  process.env.JIRA_PRIVATE_KEY ||
  fs.readFileSync(process.env.JIRA_PRIVATE_KEY_FILE!, 'utf8');

export const jiraApi = new JiraApi({
  protocol: 'https',
  host: process.env.JIRA_HOST!,
  apiVersion: '2',
  strictSSL: true,
  oauth: {
    consumer_key: 'roadmapper',
    consumer_secret: JIRA_PRIVATEKEY,
    access_token: process.env.JIRA_ACCESS_TOKEN!,
    access_token_secret: process.env.JIRA_ACCESS_TOKEN_SECRET!,
  },
});
