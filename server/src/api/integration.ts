import { TaskStatus } from './../../../shared/types/customTypes';
export interface IntegrationConfig {
  name: string;
  host: string;
  projectId?: string;
  consumerkey: string;
  privatekey: string;
}

export type ImportedTask = {
  id: string;
  link: string;
  name: string;
  description: string;
  createdAt: string;
  status?: TaskStatus;
  columnId?: string;
};

export interface TaskFilters {
  labels?: string[];
}

export interface OAuthProvider {
  instance: string;
  authorizationURL(
    roadmapId: number,
  ): Promise<{
    url: string;
    token: string;
    tokenSecret: string;
  }>;
  swapOAuthToken(swapTokens: {
    verifierToken: string;
    token: string;
    tokenSecret: string;
    roadmapId: number;
  }): Promise<{ accessToken: string; refreshToken?: string }>;

  tokenRefresh?(
    refreshToken: string,
    roadmapId: number,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

export class InvalidTokenError extends Error {}
export class InvalidGrantError extends Error {}

export const convertError = (err: { statusCode: number; data?: any }) => {
  if (err.statusCode === 401 && /token/i.test(err.data))
    return new InvalidTokenError(err.data);
  if (err.statusCode === 400 && /grant/i.test(err.data))
    return new InvalidGrantError(err.data);
  return err;
};

export interface IntegrationProvider {
  boards(): Promise<{ id: string; name: string }[]>;
  columns(boardId: string): Promise<{ id: string; name: string }[]>;
  labels(boardId: string): Promise<string[]>;
  tasks(boardId: string, filters?: TaskFilters): Promise<ImportedTask[]>;
}

export interface IntegrationEntry {
  defaultConfig?: { [field: string]: string };
  configOptions: {
    field: string;
    secret?: boolean;
  }[];
  getIntegrationProvider: (
    config: IntegrationConfig,
    tokens: {
      accessToken: string;
      accessTokenSecret: string;
      refreshToken: string;
    },
  ) => IntegrationProvider;
  getOAuthProvider: (config: IntegrationConfig) => OAuthProvider;
}

const integrations = new Map<string, IntegrationEntry>();

export const availableIntegrations = () => {
  const available: {
    [name: string]: IntegrationEntry['configOptions'];
  } = {};
  integrations.forEach(({ configOptions }, name) => {
    available[name] = configOptions;
  });
  return available;
};

export const hasIntegration = (name: string) => integrations.has(name);

export const getIntegration = (name: string) => {
  const entry = integrations.get(name);
  if (!entry) {
    throw new Error(`unknown integration: ${name}`);
  }
  return entry;
};

export const registerIntegration = (
  name: string,
  integration: IntegrationEntry,
) => {
  if (integrations.has(name)) {
    throw new Error(`duplicate integration registration for name: ${name}`);
  }
  integrations.set(name, integration);
};
