import { SyntheticEvent, FC } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, ShowModalPayload } from './modals/types';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { getType, representsCustomers } from '../utils/UserUtils';
import { awaitsUserRatings } from '../utils/TaskUtils';
import '../shared.scss';

export const TaskModalButtons: FC<{
  task: Task;
  overview?: true;
}> = ({ task, overview }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { roadmapId } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmapId);

  const openModal = (payload: ShowModalPayload) => (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(modalsActions.showModal(payload));
  };

  const openNotifyModal = openModal({
    modalType: ModalTypes.NOTIFY_USERS_MODAL,
    modalProps: { taskId: task.id },
  });

  const openRateModal = openModal({
    modalType: ModalTypes.RATE_TASK_MODAL,
    modalProps: { taskId: task.id, edit: false },
  });

  if (!userInfo) return null;
  const awaitsRatings = awaitsUserRatings(userInfo, roadmapId)(task);
  if (overview && !awaitsRatings) return null;
  return (
    <div>
      {type === RoleType.Admin && (
        <button
          style={{ marginRight: '10px' }}
          className="button-small-outlined"
          type="button"
          onClick={openNotifyModal}
        >
          <Trans i18nKey="Notify" />
        </button>
      )}
      {userInfo &&
        (type === RoleType.Developer ||
          representsCustomers(userInfo, roadmapId)) && (
          <button
            className="button-small-filled"
            type="button"
            disabled={!awaitsRatings}
            onClick={openRateModal}
          >
            <Trans i18nKey="Rate" />
          </button>
        )}
    </div>
  );
};
