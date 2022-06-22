import { FC, useMemo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Customer,
  RoadmapUser,
  Invitation,
  Task,
  InfoModalContent,
  CheckableUserWithCustomers,
  Taskrating,
  TaskRelation,
  VersionComplexityAndValues,
} from '../../redux/roadmaps/types';
import { UserModifyRequest, UserDeleteRequest } from '../../redux/user/types';

export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
  RATE_TASK_MODAL = 'RATE_TASK_MODAL',
  REMOVE_TASK_MODAL = 'REMOVE_TASK_MODAL',
  REMOVE_PEOPLE_MODAL = 'REMOVE_PEOPLE_MODAL',
  REMOVE_RATING_MODAL = 'REMOVE_RATING_MODAL',
  EDIT_CUSTOMER_MODAL = 'EDIT_CUSTOMER_MODAL',
  ADD_CUSTOMER_MODAL = 'ADD_CUSTOMER_MODAL',
  ADD_TEAM_MEMBER_MODAL = 'ADD_TEAM_MEMBER_MODAL',
  EDIT_TEAM_MEMBER_MODAL = 'EDIT_TEAM_MEMBER_MODAL',
  SEND_INVITATION_MODAL = 'SEND_INVITATION_MODAL',
  ADD_VERSION_MODAL = 'ADD_VERSION_MODAL',
  DELETE_VERSION_MODAL = 'DELETE_VERSION_MODAL',
  EDIT_VERSION_MODAL = 'EDIT_VERSION_MODAL',
  COMPLETE_VERSION_MODAL = 'COMPLETE_VERSION_MODAL',
  IMPORT_TASKS_MODAL = 'IMPORT_TASKS_MODAL',
  SETUP_OAUTH_MODAL = 'SETUP_OAUTH_MODAL',
  USER_AUTH_TOKEN_MODAL = 'USER_AUTH_TOKEN_MODAL',
  ADD_ROADMAP_MODAL = 'ADD_ROADMAP_MODAL',
  DELETE_ROADMAP_MODAL = 'DELETE_ROADMAP_MODAL',
  NOTIFY_USERS_MODAL = 'NOTIFY_USERS_MODAL',
  JOIN_PROJECT_MODAL = 'JOIN_PROJECT_MODAL',
  JOIN_LINK_INVALID_MODAL = 'JOIN_LINK_INVALID_MODAL',
  JOIN_LINK_NO_ACCESS_MODAL = 'JOIN_LINK_NO_ACCESS_MODAL',
  CONFIRM_PASSWORD_MODAL = 'CONFIRM_PASSWORD_MODAL',
  CHANGE_PASSWORD_MODAL = 'CHANGE_PASSWORD_MODAL',
  INFO_MODAL = 'INFO_MODAL',
  LEAVE_ROADMAP_MODAL = 'LEAVE_ROADMAP_MODAL',
  RELATIONS_MODAL = 'RELATIONS_MODAL',
  VERSION_DETAILS_MODAL = 'VERSION_DETAILS_MODAL',
  TASK_MAP_INFO_MODAL = 'TASK_MAP_INFO_MODAL',
}

type OwnProps = {
  [ModalTypes.ADD_TASK_MODAL]: {};
  [ModalTypes.RATE_TASK_MODAL]: { task: Task; edit: boolean };
  [ModalTypes.REMOVE_TASK_MODAL]: { task: Task };
  [ModalTypes.REMOVE_PEOPLE_MODAL]: {
    id: number | string;
    name: string;
    type: 'customer' | 'team' | 'invitation';
  };
  [ModalTypes.REMOVE_RATING_MODAL]: {
    roadmapId: number;
    rating: Taskrating;
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
  [ModalTypes.COMPLETE_VERSION_MODAL]: {
    id: number;
    name: string;
  };
  [ModalTypes.IMPORT_TASKS_MODAL]: { name: string };
  [ModalTypes.SETUP_OAUTH_MODAL]: {
    name: string;
    roadmapId: number;
    code?: string;
  };
  [ModalTypes.USER_AUTH_TOKEN_MODAL]: {};
  [ModalTypes.ADD_ROADMAP_MODAL]: {};
  [ModalTypes.DELETE_ROADMAP_MODAL]: {
    id: number;
  };
  [ModalTypes.NOTIFY_USERS_MODAL]: {
    taskId: number;
    missingDevelopers: CheckableUserWithCustomers[];
    missingUsers: CheckableUserWithCustomers[];
  };
  [ModalTypes.JOIN_PROJECT_MODAL]: { invitation: Invitation };
  [ModalTypes.JOIN_LINK_INVALID_MODAL]: {};
  [ModalTypes.JOIN_LINK_NO_ACCESS_MODAL]: { invitationLink: string };
  [ModalTypes.CONFIRM_PASSWORD_MODAL]:
    | {
        actionData: Omit<UserModifyRequest, 'currentPassword'>;
        deleteUser?: false;
      }
    | {
        actionData: Omit<UserDeleteRequest, 'currentPassword'>;
        deleteUser: true;
      };
  [ModalTypes.CHANGE_PASSWORD_MODAL]: { id: number };
  [ModalTypes.INFO_MODAL]: { header: string; content: InfoModalContent };
  [ModalTypes.LEAVE_ROADMAP_MODAL]: {
    roadmapId: number;
  };
  [ModalTypes.RELATIONS_MODAL]: {
    taskId: number;
    badRelations: TaskRelation[];
  };
  [ModalTypes.VERSION_DETAILS_MODAL]: {
    version: VersionComplexityAndValues;
    showShares: boolean;
  };
  [ModalTypes.TASK_MAP_INFO_MODAL]: {};
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

type ModalAction = 'openModal' | 'openDrawer';

const link = (action: ModalAction) => <T extends ModalTypes>(
  modalType: T,
  payload: Props[T],
) =>
  `?${action}=${modalType}&modalProps=${encodeURIComponent(
    JSON.stringify(payload),
  )}`;

export const modalLink = link('openModal');
export const modalDrawerLink = link('openDrawer');

export const useModal = <T extends ModalTypes>(
  action: ModalAction,
  type?: T,
) => {
  const history = useHistory();
  const { pathname, search } = useLocation();

  const payload = useMemo(() => {
    const query = new URLSearchParams(search);
    const modalType = query.get(action);
    const queryProps = query.get('modalProps');
    if (!modalType || !queryProps) return null;

    const isValidType = type ? modalType === type : modalType in ModalTypes;
    if (!isValidType) return null;

    try {
      const modalProps = JSON.parse(queryProps);
      return { modalType, modalProps } as ShowModalPayload<T>;
    } catch {
      return null;
    }
  }, [search, action, type]);

  const close = useCallback(() => {
    history.replace(pathname);
  }, [history, pathname]);

  return { payload, close };
};
