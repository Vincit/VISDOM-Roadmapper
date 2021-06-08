import { ModalsState } from './modals/types';
import { RoadmapsState } from './roadmaps/types';
import { UserState } from './user/types';
import { VersionsState } from './versions/types';

export interface RootState {
  user: UserState;
  roadmaps: RoadmapsState;
  modals: ModalsState;
  versions: VersionsState;
}

export interface IntegrationBoard {
  id: string;
  name: string;
}

export interface Integrations {
  [name: string]: {
    field: string;
    secret?: boolean;
  }[];
}
