import { UserState } from './user/types';
import { RoadmapsState } from './roadmaps/types';
import { ModalsState } from './modals/types';

export interface RootState {
  user: UserState;
  roadmaps: RoadmapsState;
  modals: ModalsState;
}
