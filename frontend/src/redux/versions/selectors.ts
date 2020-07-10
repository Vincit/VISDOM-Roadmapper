import { chosenRoadmapIdSelector } from '../roadmaps/selectors';
import { RootState } from '../types';
import { Version } from './types';

export const roadmapsVersionsSelector = (
  state: RootState,
): Version[] | undefined => {
  const chosenRoadmapId = chosenRoadmapIdSelector(state);
  if (!chosenRoadmapId) {
    return undefined;
  }
  if (!state.versions.versions) return undefined;
  return state.versions.versions.filter(
    (version) => version.roadmapId === chosenRoadmapId,
  );
};
