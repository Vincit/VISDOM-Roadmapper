import { chosenRoadmapIdSelector } from '../roadmaps/selectors';
import { RootState } from '../types';
import { Version } from './types';

export const selectedVersionIdSelector = (
  state: RootState,
): number | undefined => state.versions.selectedVersionId;

export const selectedVersionSelector = (
  state: RootState,
): Version | undefined =>
  state.versions.versions?.find(
    (version) => version.id === state.versions.selectedVersionId,
  );

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
