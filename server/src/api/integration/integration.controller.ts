import { Permission, TaskStatus } from './../../../../shared/types/customTypes';
import { ClientEvents } from './../../../../shared/types/sockettypes';
import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import { IKoaContext, RouteHandlerFnc } from '../../types/customTypes';
import Integration from './integration.model';
import Task from '../tasks/tasks.model';
import Token from '../tokens/tokens.model';
import Roadmap from '../roadmaps/roadmaps.model';
import { getIntegration, InvalidTokenError } from '../integration';

const integrationConfig = async (name: string, roadmapId: number) => {
  const config = await Integration.query()
    .findOne({ name, roadmapId })
    .withGraphFetched('statusMapping');
  if (!config) {
    throw new Error(`Missing configuration for ${name}.`);
  }
  return config;
};

const integrationTokens = async (config: Integration, forUser?: number) => {
  const query = Token.query()
    .where({ forIntegration: config.id })
    .whereIn('type', ['access_token', 'access_token_secret', 'refresh_token']);
  if (forUser) query.where({ user: forUser });
  const tokens = await query;
  const accessToken = tokens?.find(({ type }) => type === 'access_token');
  const accessTokenSecret = tokens?.find(
    ({ type }) => type === 'access_token_secret',
  );
  const refreshToken = tokens?.find(({ type }) => type === 'refresh_token');
  if (!accessToken || (!accessTokenSecret && !refreshToken)) {
    throw new InvalidTokenError('Missing tokens.');
  }
  return {
    accessToken: accessToken.value,
    accessTokenSecret: accessTokenSecret ? accessTokenSecret.value : '',
    refreshToken: refreshToken ? refreshToken.value : '',
  };
};

const integrationProvider = async (
  ctx: IKoaContext,
  withUsersTokens?: number,
) => {
  const { integrationName, roadmapId } = ctx.params;
  const { getIntegrationProvider } = getIntegration(integrationName);
  const config = await integrationConfig(integrationName, Number(roadmapId));
  const tokens = await integrationTokens(config, withUsersTokens);
  return {
    config,
    provider: getIntegrationProvider(config, tokens),
  };
};

const oAuthProvider = async (ctx: IKoaContext) => {
  const { roadmapId, integrationName } = ctx.params;
  const { getOAuthProvider } = getIntegration(integrationName);
  const config = await integrationConfig(integrationName, Number(roadmapId));
  return getOAuthProvider(config);
};

export const postConfigurations: RouteHandlerFnc = async (ctx) => {
  const { defaultConfig } = getIntegration(ctx.params.integrationName);
  const { host, consumerkey, privatekey, boardId, projectId } = {
    ...defaultConfig,
    ...ctx.request.body,
  } as any;
  ctx.body = await Integration.query().insertAndFetch({
    ...defaultConfig,
    name: ctx.params.integrationName,
    host,
    consumerkey,
    privatekey,
    projectId,
    boardId,
    roadmapId: Number(ctx.params.roadmapId),
  });
};

const withTokenRefresh = async (
  ctx: IKoaContext,
  resourceCall: () => Promise<any>,
) => {
  try {
    return await resourceCall();
  } catch (err) {
    const provider = await oAuthProvider(ctx);
    if (err instanceof InvalidTokenError && provider.tokenRefresh) {
      const { roadmapId, integrationName } = ctx.params;
      const userId = ctx.state.user.id;
      const config = await integrationConfig(
        integrationName,
        Number(roadmapId),
      );
      const tokens = await integrationTokens(config, userId);
      const { accessToken, refreshToken } = await provider.tokenRefresh(
        tokens.refreshToken,
        roadmapId,
      );
      await Token.transaction(async (trx) => {
        // TODO: interface, class or something else to represent the token contents.
        const upsertToken = async (type: string, value: string) => {
          // TODO: Extract providers and token types somewhere to avoid magic numbers.
          const newToken = {
            forIntegration: config.id,
            provider: integrationName,
            instance: provider.instance,
            user: userId,
            type,
            value,
          };
          const existing = await Token.query(trx).findOne({
            forIntegration: newToken.forIntegration,
            type: newToken.type,
          });
          if (existing) {
            await existing.$query(trx).patchAndFetch(newToken);
          } else {
            await Token.query(trx).insert(newToken);
          }
        };
        await upsertToken('access_token', accessToken);
        await upsertToken('refresh_token', refreshToken);
      });
    }
    throw err;
  }
};

export const patchConfigurations: RouteHandlerFnc = async (ctx) => {
  const {
    id,
    name,
    host,
    consumerkey,
    privatekey,
    boardId,
    statusMapping,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await Integration.query()
    .patchAndFetchById(Number(ctx.params.integrationId), {
      host,
      consumerkey,
      privatekey,
      boardId,
    })
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      name: ctx.params.integrationName,
    });

  if (!updated) {
    return void (ctx.status = 404);
  } else {
    return void (ctx.body = updated);
  }
};

export const deleteConfigurations: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Integration.query()
    .findById(Number(ctx.params.integrationId))
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      name: ctx.params.integrationName,
    })
    .delete();

  ctx.status = numDeleted === 1 ? 200 : 404;
};

export const getBoards: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const { provider } = await integrationProvider(ctx, ctx.state.user.id);
  ctx.body = await withTokenRefresh(ctx, () => provider.boards());
};

export const getSelectedBoard: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const {
    provider,
    config: { boardId },
  } = await integrationProvider(ctx);
  if (!boardId) {
    throw new Error('Invalid config: board id missing');
  }

  ctx.body = await withTokenRefresh(ctx, async () =>
    (await provider.boards()).find(({ id }: { id: string }) => id === boardId),
  );
};

export const getBoardColumns: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const {
    provider,
    config: { boardId },
  } = await integrationProvider(ctx);
  if (!boardId) {
    throw new Error('Invalid config: board id missing');
  }
  ctx.body = await withTokenRefresh(ctx, () => provider.columns(boardId));
  ctx.status = 200;
};

export const getBoardLabels: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const {
    provider,
    config: { boardId },
  } = await integrationProvider(ctx);
  if (!boardId) {
    throw new Error('Invalid config: board id missing');
  }
  ctx.body = await provider.labels(boardId);
  ctx.status = 200;
};

export const importBoard: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const {
    provider,
    config: { boardId, statusMapping },
  } = await integrationProvider(ctx);
  if (!boardId) {
    throw new Error('Invalid config: board id missing');
  }
  const createdByUser = ctx.state.user.id;
  const name = ctx.params.integrationName;
  const { filters } = ctx.request.body;
  const roadmapId = Number(ctx.params.roadmapId);

  const tasks = (await provider.tasks(boardId, filters)).map(
    ({ id, link, description, status, columnId, ...issue }) => ({
      ...issue,
      description: description.substring(0, 1000), // TODO: should we allow longer description?
      importedFrom: name,
      externalId: id,
      externalLink: link,
      createdByUser,
      roadmapId,
      status:
        statusMapping?.find(({ fromColumn }) => fromColumn === columnId)
          ?.toStatus ??
        status ??
        TaskStatus.NOT_STARTED,
    }),
  );

  const ok = await Roadmap.transaction(async (trx) => {
    const roadmap = await Roadmap.query(trx).findById(roadmapId);
    if (!roadmap) {
      ctx.status = 404;
      return false;
    }
    for (let task of tasks) {
      const existing = await roadmap
        .$relatedQuery('tasks', trx)
        .where('externalId', task.externalId)
        .where('importedFrom', name)
        .first();
      if (existing) {
        await existing.$query(trx).patchAndFetch({
          ...task,
          lastUpdatedByUserId: task.createdByUser,
          // Don't update the status backwards from an import
          // This assumes that the status does not go backwards in the source,
          // or in the mapping.
          status: Math.max(task.status, existing.status),
        });
      } else {
        await Task.query(trx).insert(task);
      }
    }
    return true;
  });

  if (!ok) return;

  await emitRoadmapEvent(ctx.io, {
    roadmapId: roadmapId,
    event: ClientEvents.TASK_UPDATED,
    dontEmitToUserIds: [ctx.state.user.id],
    requirePermission: Permission.TaskRead,
    eventParams: [],
  });

  ctx.body = `${tasks.length} tasks imported`;
  ctx.status = 200;
};

export const getOauthAuthorizationURL: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const { roadmapId } = ctx.params;
  const provider = await oAuthProvider(ctx);
  try {
    ctx.body = await provider.authorizationURL(roadmapId);
    ctx.status = 200;
  } catch (error) {
    throw new Error(
      `Error in getting ${ctx.params.integrationName} OAuth authorization URL: ${error}`,
    );
  }
};

export const swapOauthAuthorizationToken: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }

  const { roadmapId, integrationName } = ctx.params;
  const { verifierToken, token, tokenSecret } = ctx.request.body;

  const { getOAuthProvider } = getIntegration(integrationName);
  const config = await integrationConfig(integrationName, Number(roadmapId));
  const provider = getOAuthProvider(config);

  try {
    const newTokens = await provider.swapOAuthToken({
      verifierToken,
      token,
      tokenSecret,
      roadmapId,
    });

    if (!newTokens) {
      throw new Error('Empty response on authorization token swap.');
    }

    const userId = ctx.state.user.id;
    await Token.transaction(async (trx) => {
      // TODO: interface, class or something else to represent the token contents.
      const upsertToken = async (type: string, value: string) => {
        // TODO: Extract providers and token types somewhere to avoid magic numbers.
        const newToken = {
          forIntegration: config.id,
          provider: integrationName,
          instance: provider.instance,
          user: userId,
          type,
          value,
        };
        const existing = await Token.query(trx).findOne({
          forIntegration: newToken.forIntegration,
          type: newToken.type,
        });
        if (existing) {
          await existing.$query(trx).patchAndFetch(newToken);
        } else {
          await Token.query(trx).insert(newToken);
        }
      };
      await upsertToken('access_token', newTokens.accessToken);
      if (tokenSecret && tokenSecret.length > 0)
        await upsertToken('access_token_secret', tokenSecret);
      if (newTokens.refreshToken && newTokens.refreshToken.length > 0)
        await upsertToken('refresh_token', newTokens.refreshToken);
    });

    ctx.status = 200;
    ctx.body = 'OAuth token swapped successfully.';
  } catch (error) {
    console.log('Controller error on OAuth URL creation:', error);
    throw new Error('Error in OAuth token swap.');
  }
};
