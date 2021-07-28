export interface VersionsState {
  timeEstimates: TimeEstimate[];
}

export interface TimeEstimate {
  roadmapId: number;
  id: number;
  estimate?: number;
}
