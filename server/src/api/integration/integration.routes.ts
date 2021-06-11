import KoaRouter from '@koa/router';
import { Context } from 'koa';

import {
  postConfigurations,
  patchConfigurations,
  deleteConfigurations,
  getBoards,
  getBoardLabels,
  importBoard,
  getOauthAuthorizationURL,
  swapOauthAuthorizationToken,
} from './integration.controller';
import {
  hasIntegration,
  availableIntegrations,
  registerIntegration,
} from '../integration';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import { JiraIntegration } from '../jira/jiraIntegration';

registerIntegration('jira', JiraIntegration);

const integrationRouter = new KoaRouter<IKoaState, Context>({
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

integrationRouter.get(`/:integrationName/boards`, getBoards);
integrationRouter.get(
  `/:integrationName/boards/:boardId/labels`,
  getBoardLabels,
);
integrationRouter.post(
  `/:integrationName/boards/:boardId/import`,
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
