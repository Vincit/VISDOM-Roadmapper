import { chosenRoadmapIdSelector } from '../roadmaps/selectors';
import { RootState } from '../types';
import { TimeEstimate } from './types';

export const plannerTimeEstimatesSelector = (
  state: RootState,
): TimeEstimate[] => {
  const chosenRoadmapId = chosenRoadmapIdSelector(state);
  if (!chosenRoadmapId) {
    return [];
  }
  return state.versions.timeEstimates.filter(
    ({ roadmapId }) => roadmapId === chosenRoadmapId,
  );
};
