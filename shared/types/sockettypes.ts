export type ClientEventsMap = {
  [ClientEvents.ROADMAP_UPDATED]: () => void;
  [ClientEvents.TASK_UPDATED]: () => void;
  [ClientEvents.USER_UPDATED]: () => void;
  [ClientEvents.CUSTOMER_UPDATED]: () => void;
  [ClientEvents.TASKRELATION_UPDATED]: () => void;
  [ClientEvents.TASKRATING_UPDATED]: () => void;
  [ClientEvents.VERSION_UPDATED]: () => void;
  [ClientEvents.USERINFO_UPDATED]: () => void;
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
  USERINFO_UPDATED = "USERINFO_UPDATED",
}

export enum ServerEvents {
  SET_SUBSCRIBED_ROADMAP = "SET_SUBSCRIBED_ROADMAP",
}

export interface SocketStatusResponse {
  status: number;
}
