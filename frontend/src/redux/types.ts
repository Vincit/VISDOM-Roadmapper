import { UserState } from './user/types';
import { RoadmapsState } from './roadmaps/types';

export interface RootState {
  user: UserState;
  roadmaps: RoadmapsState;
}
