export type ClientEventsMap = {
  [ClientEvents.ROADMAP_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.TASK_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.USER_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.CUSTOMER_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.TASKRELATION_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.TASKRATING_UPDATED]: (roadmapId: number) => void;
  [ClientEvents.VERSION_UPDATED]: (roadmapId: number) => void;
};

export type ServerEventsMap = {
  [ServerEvents.SET_SUBSCRIBED_ROADMAP]: (
    roadmapId: number | undefined | null,
    callback?: (res: SocketStatusResponse) => void
  ) => Promise<void>;
};

export enum ClientEvents {
  ROADMAP_UPDATED = "ROADMAP_UPDATED",
  USER_UPDATED = "USER_UPDATED",
  TASK_UPDATED = "TASK_UPDATED",
  CUSTOMER_UPDATED = "CUSTOMER_UPDATED",
  TASKRELATION_UPDATED = "TASKRELATION_UPDATED",
  TASKRATING_UPDATED = "TASKRATING_UPDATED",
  VERSION_UPDATED = "VERSION_UPDATED",
}

export enum ServerEvents {
  SET_SUBSCRIBED_ROADMAP = "SET_SUBSCRIBED_ROADMAP",
}

export interface SocketStatusResponse {
  status: number;
}
