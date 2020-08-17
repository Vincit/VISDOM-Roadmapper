import { TaskRequest } from '../roadmaps/types';

export interface Version {
  roadmapId: number;
  id: number;
  name: string;
  tasks: number[];
  sortingRank: number;
}

export interface VersionsState {
  versions: Version[] | undefined;
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
