export type ClientEventsMap = {
  [ClientEvents.ROADMAP_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.TASK_UPDATED]: (roadmapId: number, taskId: number) => void;
  [ClientEvents.USERS_UPDATED]: (roadmapId: number) => void;
};

export type ServerEventsMap = {
  [ServerEvents.SET_SUBSCRIBED_ROADMAP]: (
    roadmapId: number | undefined | null,
    callback?: (res: SocketStatusResponse) => void
  ) => Promise<void>;
};

export enum ClientEvents {
  ROADMAP_UPDATED = "ROADMAP_UPDATED",
  USERS_UPDATED = "USERS_UPDATED",
  TASK_UPDATED = "TASK_UPDATED",
}

export enum ServerEvents {
  SET_SUBSCRIBED_ROADMAP = "SET_SUBSCRIBED_ROADMAP",
}

export interface SocketStatusResponse {
  status: number;
}
