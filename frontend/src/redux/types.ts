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
