import fs from 'fs';
import JiraApi from 'jira-client';

export const jiraApi = new JiraApi({
  protocol: 'https',
  host: process.env.JIRA_HOST!,
  apiVersion: '2',
  strictSSL: true,
  oauth: {
    consumer_key: 'roadmapper',
    consumer_secret: fs.readFileSync(
      process.env.JIRA_PRIVATE_KEY_FILE!,
      'utf8',
    ),
    access_token: process.env.JIRA_ACCESS_TOKEN!,
    access_token_secret: process.env.JIRA_ACCESS_TOKEN_SECRET!,
  },
});
