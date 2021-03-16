import { chosenRoadmapIdSelector } from '../roadmaps/selectors';
import { RootState } from '../types';
import { Version, TimeEstimate } from './types';

export const roadmapsVersionsSelector = (
  state: RootState,
): Version[] | undefined => {
  const chosenRoadmapId = chosenRoadmapIdSelector(state);
  if (!chosenRoadmapId) {
    return undefined;
  }
  if (!state.versions.versions) return undefined;
  return state.versions.versions
    .filter((version) => version.roadmapId === chosenRoadmapId)
    .sort((a, b) => a.sortingRank - b.sortingRank);
};

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
