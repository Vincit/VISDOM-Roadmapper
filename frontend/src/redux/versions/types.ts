export interface Version {
  roadmapId: number;
  id: number;
  name: string;
  tasks: number[];
}

export interface VersionsState {
  selectedVersionId: number | undefined;
  versions: Version[] | undefined;
}

export interface VersionRequest {
  roadmapId?: number;
  id?: number;
  name?: string;
  tasks?: number[];
}
