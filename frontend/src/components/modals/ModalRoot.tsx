import { useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import ReactModal from 'react-modal';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals/index';
import { modalStateSelector } from '../../redux/modals/selectors';
import { ModalsState, ModalTypes, modalLink, Modal } from './types';
import { RootState } from '../../redux/types';

import { AddTaskModal } from './AddTaskModal';
import { AddVersionModal } from './AddVersionModal';
import { DeleteVersionModal, DeleteRoadmapModal } from './DeleteModal';
import { EditVersionModal } from './EditVersionModal';
import { CompleteVersionModal } from './CompleteVersionModal';
import { RemoveTaskModal } from './RemoveTaskModal';
import { RemoveRatingModal } from './RemoveRatingModal';
import { ImportTasksModal } from './ImportTasksModal';
import { OauthModal } from './IntegrationOauthModal';
import { RateTaskModal } from './RateTaskModal';
import { RemovePeopleModal } from './RemovePeopleModal';
import { EditCustomerModal } from './EditCustomerModal';
import { AddCustomerModal } from './AddCustomerModal';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { EditTeamMemberModal } from './EditTeamMemberModal';
import { UserAuthTokenModal } from './UserAuthTokenModal';
import { AddRoadmapModal } from './AddRoadmapModal';
import { NotifyUsersModal } from './NotifyUsersModal';
import { SendInvitationModal } from './SendInvitationModal';
import { JoinProjectModal } from './JoinProjectModal';
import { JoinLinkInvalidModal } from './JoinLinkInvalidModal';
import { JoinLinkNoAccessModal } from './JoinLinkNoAccessModal';
import { ConfirmPasswordModal } from './ConfirmPasswordModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { InfoModal } from './InfoModal';
import { LeaveRoadmapModal } from './LeaveRoadmapModal';
import { RelationsModal } from './RelationsModal';
import { VersionDetailsModal } from './VersionDetailsModal';
import { TaskMapInfoModal } from './TaskMapInfoModal';

const Modals: { readonly [T in ModalTypes]: Modal<T> } = {
  [ModalTypes.ADD_TASK_MODAL]: AddTaskModal,
  [ModalTypes.RATE_TASK_MODAL]: RateTaskModal,
  [ModalTypes.REMOVE_TASK_MODAL]: RemoveTaskModal,
  [ModalTypes.REMOVE_PEOPLE_MODAL]: RemovePeopleModal,
  [ModalTypes.REMOVE_RATING_MODAL]: RemoveRatingModal,
  [ModalTypes.EDIT_CUSTOMER_MODAL]: EditCustomerModal,
  [ModalTypes.ADD_CUSTOMER_MODAL]: AddCustomerModal,
  [ModalTypes.ADD_TEAM_MEMBER_MODAL]: AddTeamMemberModal,
  [ModalTypes.EDIT_TEAM_MEMBER_MODAL]: EditTeamMemberModal,
  [ModalTypes.ADD_VERSION_MODAL]: AddVersionModal,
  [ModalTypes.DELETE_VERSION_MODAL]: DeleteVersionModal,
  [ModalTypes.EDIT_VERSION_MODAL]: EditVersionModal,
  [ModalTypes.COMPLETE_VERSION_MODAL]: CompleteVersionModal,
  [ModalTypes.IMPORT_TASKS_MODAL]: ImportTasksModal,
  [ModalTypes.SETUP_OAUTH_MODAL]: OauthModal,
  [ModalTypes.USER_AUTH_TOKEN_MODAL]: UserAuthTokenModal,
  [ModalTypes.ADD_ROADMAP_MODAL]: AddRoadmapModal,
  [ModalTypes.DELETE_ROADMAP_MODAL]: DeleteRoadmapModal,
  [ModalTypes.NOTIFY_USERS_MODAL]: NotifyUsersModal,
  [ModalTypes.SEND_INVITATION_MODAL]: SendInvitationModal,
  [ModalTypes.JOIN_PROJECT_MODAL]: JoinProjectModal,
  [ModalTypes.JOIN_LINK_INVALID_MODAL]: JoinLinkInvalidModal,
  [ModalTypes.JOIN_LINK_NO_ACCESS_MODAL]: JoinLinkNoAccessModal,
  [ModalTypes.CONFIRM_PASSWORD_MODAL]: ConfirmPasswordModal,
  [ModalTypes.CHANGE_PASSWORD_MODAL]: ChangePasswordModal,
  [ModalTypes.INFO_MODAL]: InfoModal,
  [ModalTypes.LEAVE_ROADMAP_MODAL]: LeaveRoadmapModal,
  [ModalTypes.RELATIONS_MODAL]: RelationsModal,
  [ModalTypes.VERSION_DETAILS_MODAL]: VersionDetailsModal,
  [ModalTypes.TASK_MAP_INFO_MODAL]: TaskMapInfoModal,
} as const;

// TODO: move this to css file
const modalCustomStyles = {
  content: {
    top: '35%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -34%)',
    minWidth: '540px',
    maxWidth: '80vw',
    maxHeight: '95vh',
    borderRadius: '20px',
    boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.25)',
  },
};

ReactModal.setAppElement('#root');
export const ModalRoot = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const modalsState = useSelector<RootState, ModalsState>(
    modalStateSelector,
    shallowEqual,
  );
  const history = useHistory();
  const { pathname, search } = useLocation();
  const ChosenModal = Modals[modalsState.modalType] as Modal<unknown>;

  const onRequestClose = useCallback(
    (success?: boolean) => {
      const next = modalsState.modalProps.onSuccess;
      dispatch(modalsActions.hideModal());
      // Remove query params from url when modal is closed
      history.replace(pathname);
      if (success && next) {
        dispatch(modalsActions.showModal(next));
      }
    },
    [dispatch, pathname, history, modalsState.modalProps],
  );

  useEffect(() => {
    // Add query params to url on open
    if (!modalsState.showModal) return;
    const queryString = modalLink(
      modalsState.modalType,
      modalsState.modalProps,
    );
    if (!search.includes(queryString)) history.replace(pathname + queryString);
  }, [
    modalsState.showModal,
    modalsState.modalProps,
    modalsState.modalType,
    history,
    pathname,
    search,
  ]);

  if (!modalsState.showModal) return null;
  return (
    <ReactModal
      isOpen
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => onRequestClose(false)}
      style={modalCustomStyles}
    >
      <ChosenModal closeModal={onRequestClose} {...modalsState.modalProps} />
    </ReactModal>
  );
};
