import { FC } from 'react';
import {
  Customer,
  IntegrationConfiguration,
  RoadmapUser,
  Invitation,
  Task,
} from '../../redux/roadmaps/types';
import { UserModifyRequest } from '../../redux/user/types';

export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
  RATE_TASK_MODAL = 'RATE_TASK_MODAL',
  REMOVE_TASK_MODAL = 'REMOVE_TASK_MODAL',
  REMOVE_PEOPLE_MODAL = 'REMOVE_PEOPLE_MODAL',
  EDIT_CUSTOMER_MODAL = 'EDIT_CUSTOMER_MODAL',
  ADD_CUSTOMER_MODAL = 'ADD_CUSTOMER_MODAL',
  ADD_TEAM_MEMBER_MODAL = 'ADD_TEAM_MEMBER_MODAL',
  EDIT_TEAM_MEMBER_MODAL = 'EDIT_TEAM_MEMBER_MODAL',
  SEND_INVITATION_MODAL = 'SEND_INVITATION_MODAL',
  ADD_VERSION_MODAL = 'ADD_VERSION_MODAL',
  DELETE_VERSION_MODAL = 'DELETE_VERSION_MODAL',
  EDIT_VERSION_MODAL = 'EDIT_VERSION_MODAL',
  IMPORT_TASKS_MODAL = 'IMPORT_TASKS_MODAL',
  SETUP_OAUTH_MODAL = 'SETUP_OAUTH_MODAL',
  INTEGRATION_CONFIGURATION_MODAL = 'INTEGRATION_CONFIGURATION_MODAL',
  USER_AUTH_TOKEN_MODAL = 'USER_AUTH_TOKEN_MODAL',
  ADD_ROADMAP_MODAL = 'ADD_ROADMAP_MODAL',
  DELETE_ROADMAP_MODAL = 'DELETE_ROADMAP_MODAL',
  NOTIFY_USERS_MODAL = 'NOTIFY_USERS_MODAL',
  JOIN_PROJECT_MODAL = 'JOIN_PROJECT_MODAL',
  JOIN_LINK_INVALID_MODAL = 'JOIN_LINK_INVALID_MODAL',
  JOIN_LINK_NO_ACCESS_MODAL = 'JOIN_LINK_NO_ACCESS_MODAL',
  CONFIRM_PASSWORD_MODAL = 'CONFIRM_PASSWORD_MODAL',
}

type OwnProps = {
  [ModalTypes.ADD_TASK_MODAL]: {};
  [ModalTypes.RATE_TASK_MODAL]: { taskId: number };
  [ModalTypes.REMOVE_TASK_MODAL]: { task: Task };
  [ModalTypes.REMOVE_PEOPLE_MODAL]: {
    id: number | string;
    name: string;
    type: 'customer' | 'team' | 'invitation';
  };
  [ModalTypes.SEND_INVITATION_MODAL]: {
    invitation: Invitation;
  };
  [ModalTypes.EDIT_CUSTOMER_MODAL]: { customer: Customer };
  [ModalTypes.ADD_CUSTOMER_MODAL]: {};
  [ModalTypes.ADD_TEAM_MEMBER_MODAL]: {};
  [ModalTypes.EDIT_TEAM_MEMBER_MODAL]: {
    member: RoadmapUser | Invitation;
  };
  [ModalTypes.ADD_VERSION_MODAL]: {};
  [ModalTypes.DELETE_VERSION_MODAL]: {
    id: number;
    roadmapId: number;
  };
  [ModalTypes.EDIT_VERSION_MODAL]: {
    id: number;
    name: string;
  };
  [ModalTypes.IMPORT_TASKS_MODAL]: { name: string };
  [ModalTypes.SETUP_OAUTH_MODAL]: {
    name: string;
    roadmapId: number;
  };
  [ModalTypes.INTEGRATION_CONFIGURATION_MODAL]: {
    name: string;
    roadmapId: number;
    roadmapName?: string;
    configuration?: IntegrationConfiguration;
    fields: { field: string; secret?: boolean }[];
  };
  [ModalTypes.USER_AUTH_TOKEN_MODAL]: {};
  [ModalTypes.ADD_ROADMAP_MODAL]: {};
  [ModalTypes.DELETE_ROADMAP_MODAL]: {
    id: number;
  };
  [ModalTypes.NOTIFY_USERS_MODAL]: { taskId: number };
  [ModalTypes.JOIN_PROJECT_MODAL]: { invitation: Invitation };
  [ModalTypes.JOIN_LINK_INVALID_MODAL]: {};
  [ModalTypes.JOIN_LINK_NO_ACCESS_MODAL]: { invitationLink: string };
  [ModalTypes.CONFIRM_PASSWORD_MODAL]: {
    actionData: Omit<UserModifyRequest, 'currentPassword'>;
  };
};

type Props = {
  [T in ModalTypes]: OwnProps[T] & { onSuccess?: ShowModalPayload };
};

export type ModalProps = {
  closeModal: (success?: boolean) => void;
};

export type Modal<T> = T extends ModalTypes
  ? FC<ModalProps & Props[T]>
  : unknown extends T
  ? FC<ModalProps>
  : never;

export type ShowModalPayload<T = ModalTypes> = T extends ModalTypes
  ? {
      modalType: T;
      modalProps: Props[T];
    }
  : never;

export type ModalsState<T = ModalTypes> = ShowModalPayload<T> & {
  showModal: boolean;
};

export const modalLink = <T extends ModalTypes>(
  modalType: T,
  payload: Props[T],
) =>
  `?openModal=${modalType}&modalProps=${encodeURIComponent(
    JSON.stringify(payload),
  )}`;
