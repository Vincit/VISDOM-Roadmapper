import { TaskRequest, Task } from '../roadmaps/types';

export interface Version {
  roadmapId: number;
  id: number;
  name: string;
  tasks: Task[];
  sortingRank: number;
}

export interface TimeEstimate {
  roadmapId: number;
  id: number;
  estimate?: number;
}

export interface VersionsState {
  versions: Version[] | undefined;
  timeEstimates: TimeEstimate[];
}

export interface VersionRequest {
  roadmapId?: number;
  id?: number;
  name?: string;
  tasks?: number[];
  sortingRank?: number;
}

export interface AddTaskToVersionRequest {
  task: TaskRequest;
  version: VersionRequest;
  index: number;
}

export interface RemoveTaskFromVersionRequest {
  task: TaskRequest;
  version: VersionRequest;
}
