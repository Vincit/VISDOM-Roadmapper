import KoaRouter from '@koa/router';

import {
  postConfigurations,
  patchConfigurations,
  deleteConfigurations,
  getBoards,
  getSelectedBoard,
  getBoardColumns,
  getBoardLabels,
  importBoard,
  getOauthAuthorizationURL,
  swapOauthAuthorizationToken,
} from './integration.controller';
import {
  setStatusMapping,
  deleteStatusMapping,
} from './statusMapping.controller';
import {
  hasIntegration,
  availableIntegrations,
  registerIntegration,
} from '../integration';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaContext, IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import { JiraIntegration } from '../jira/jiraIntegration';
import { TrelloIntegration } from '../trello/trelloIntegration';
import { GitLabIntegration } from '../gitLab/gitLabIntergration';

registerIntegration('jira', JiraIntegration);
registerIntegration('trello', TrelloIntegration);
registerIntegration('gitLab', GitLabIntegration);

const integrationRouter = new KoaRouter<IKoaState, IKoaContext>({
  prefix: '/integrations',
});

integrationRouter.get('/', async (ctx) => {
  ctx.body = availableIntegrations();
});

integrationRouter.use('/:integrationName', async (ctx, next) => {
  if (hasIntegration(ctx.params.integrationName)) {
    await next();
  }
});

integrationRouter.post(
  '/:integrationName/configuration/',
  requirePermission(Permission.IntegrationConfigurationEdit),
  postConfigurations,
);
integrationRouter.patch(
  '/:integrationName/configuration/:integrationId',
  requirePermission(Permission.IntegrationConfigurationEdit),
  patchConfigurations,
);
integrationRouter.delete(
  '/:integrationName/configuration/:integrationId',
  requirePermission(Permission.IntegrationConfigurationEdit),
  deleteConfigurations,
);

integrationRouter.post(
  '/:integrationName/configuration/:integrationId/statusmapping',
  requirePermission(Permission.IntegrationConfigurationEdit),
  setStatusMapping,
);
integrationRouter.delete(
  '/:integrationName/configuration/:integrationId/statusmapping/:mappingId',
  requirePermission(Permission.IntegrationConfigurationEdit),
  deleteStatusMapping,
);

integrationRouter.get(`/:integrationName/boards`, getBoards);
integrationRouter.get(`/:integrationName/boards/selected`, getSelectedBoard);
integrationRouter.get(`/:integrationName/columns`, getBoardColumns);
integrationRouter.get(`/:integrationName/labels`, getBoardLabels);
integrationRouter.post(
  `/:integrationName/import`,
  requirePermission(Permission.TaskCreate | Permission.TaskEdit),
  importBoard,
);

integrationRouter.get(
  `/:integrationName/oauth/authorizationurl`,
  getOauthAuthorizationURL,
);
integrationRouter.post(
  `/:integrationName/oauth/swaptoken`,
  swapOauthAuthorizationToken,
);

export default integrationRouter;
