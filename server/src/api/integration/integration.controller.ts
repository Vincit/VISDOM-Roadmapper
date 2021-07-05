import { Context } from 'koa';
import { RouteHandlerFnc } from '../../types/customTypes';
import Integration from './integration.model';
import Task from '../tasks/tasks.model';
import Token from '../tokens/tokens.model';
import Roadmap from '../roadmaps/roadmaps.model';
import { getIntegration, InvalidTokenError } from '../integration';

const integrationConfig = async (name: string, roadmapId: number) => {
  const config = await Integration.query().where({ name, roadmapId }).first();
  if (!config) {
    throw `Missing configuration for ${name}.`;
  }
  return config;
};

const integrationTokens = async (config: Integration, userId: number) => {
  const tokens = await Token.query()
    .where({ user: userId, provider: config.name, instance: config.host })
    .whereIn('type', ['access_token', 'access_token_secret']);

  const accessToken = tokens?.find(({ type }) => type === 'access_token');
  const accessTokenSecret = tokens?.find(
    ({ type }) => type === 'access_token_secret',
  );
  if (!accessToken || !accessTokenSecret) {
    throw new InvalidTokenError('Missing tokens.');
  }
  return {
    accessToken: accessToken.value,
    accessTokenSecret: accessTokenSecret.value,
  };
};

const integrationProvider = async (ctx: Context) => {
  const { integrationName, roadmapId } = ctx.params;
  const { getIntegrationProvider } = getIntegration(integrationName);
  const config = await integrationConfig(integrationName, Number(roadmapId));
  const tokens = await integrationTokens(config, ctx.state.user.id);
  return getIntegrationProvider(config, tokens);
};

const oAuthProvider = async (ctx: Context) => {
  const { roadmapId, integrationName } = ctx.params;
  const { getOAuthProvider } = getIntegration(integrationName);
  const config = await integrationConfig(integrationName, Number(roadmapId));
  return getOAuthProvider(config);
};

export const postConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const { defaultConfig } = getIntegration(ctx.params.integrationName);
  const { host, consumerkey, privatekey } = {
    ...defaultConfig,
    ...ctx.request.body,
  } as any;
  ctx.body = await Integration.query().insertAndFetch({
    ...defaultConfig,
    name: ctx.params.integrationName,
    host,
    consumerkey,
    privatekey,
    roadmapId: Number(ctx.params.roadmapId),
  });
};

export const patchConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const {
    id,
    name,
    host,
    consumerkey,
    privatekey,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await Integration.query()
    .patchAndFetchById(Number(ctx.params.integrationId), {
      host,
      consumerkey,
      privatekey,
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

export const deleteConfigurations: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Integration.query()
    .findById(Number(ctx.params.integrationId))
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      name: ctx.params.integrationName,
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const getBoards: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const provider = await integrationProvider(ctx);
  ctx.body = await provider.boards();
};

export const getBoardLabels: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const provider = await integrationProvider(ctx);
  ctx.body = await provider.labels(ctx.params.boardId);
  ctx.status = 200;
};

export const importBoard: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const provider = await integrationProvider(ctx);
  const name = ctx.params.integrationName;
  const { createdByUser, filters } = ctx.request.body;
  const roadmapId = Number(ctx.params.roadmapId);
  const boardId = ctx.params.boardId;

  const tasks = (await provider.tasks(boardId, filters)).map(
    ({ id, link, description, ...issue }) => ({
      ...issue,
      description: description.substring(0, 1000), // TODO: should we allow longer description?
      importedFrom: name,
      externalId: id,
      externalLink: link,
      createdByUser, // TODO: should this be taken from the current user?
      roadmapId,
    }),
  );

  const importedTasks: Task[] = [];
  await Roadmap.transaction(async (trx) => {
    const roadmap = await Roadmap.query(trx).findById(roadmapId);
    for (let task of tasks) {
      const existing = await roadmap
        .$relatedQuery('tasks', trx)
        .where('externalId', task.externalId)
        .where('importedFrom', name)
        .first();
      if (existing) {
        const imported = await existing.$query(trx).patchAndFetch(task);
        importedTasks.push(imported);
      } else {
        const imported = await Task.query(trx).insert(task);
        importedTasks.push(imported);
      }
    }
  });

  ctx.body = importedTasks.length + ' tasks imported';
  ctx.status = 200;
};

export const getOauthAuthorizationURL: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const provider = await oAuthProvider(ctx);
  try {
    ctx.body = await provider.authorizationURL();
    ctx.status = 200;
  } catch (error) {
    throw new Error(
      `Error in getting ${ctx.params.integrationName} OAuth authorization URL: ${error}`,
    );
  }
};

export const swapOauthAuthorizationToken: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }

  const { integrationName } = ctx.params;
  const { verifierToken, token, tokenSecret } = ctx.request.body;

  const provider = await oAuthProvider(ctx);
  try {
    const newToken = await provider.swapOAuthToken({
      token,
      tokenSecret,
      verifierToken,
    });

    if (!newToken) {
      throw new Error('Empty response on authorization token swap.');
    }

    const userId = ctx.state.user.id;
    await Token.transaction(async (trx) => {
      // TODO: interface, class or something else to represent the token contents.
      const upsertToken = async (newToken: {
        provider: string;
        instance: string;
        type: string;
        user: number;
        value: string;
      }) => {
        // TODO: Extract providers and token types somewhere to avoid magic numbers.
        const existing = await Token.query(trx)
          .where('tokens.user', newToken.user)
          .where('provider', newToken.provider)
          .where('instance', newToken.instance)
          .where('type', newToken.type)
          .first();
        if (existing) {
          await existing.$query(trx).patchAndFetch(newToken);
        } else {
          await Token.query(trx).insert(newToken);
        }
      };
      await upsertToken({
        provider: integrationName,
        instance: provider.instance,
        type: 'access_token',
        user: userId,
        value: newToken,
      });
      await upsertToken({
        provider: integrationName,
        instance: provider.instance,
        type: 'access_token_secret',
        user: userId,
        value: tokenSecret,
      });
    });

    ctx.status = 200;
    ctx.body = 'OAuth token swapped successfully.';
  } catch (error) {
    console.log('Controller error on OAuth URL creation:', error);
    throw new Error('Error in OAuth token swap.');
  }
};
