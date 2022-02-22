import { SyntheticEvent, FC } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, ShowModalPayload } from './modals/types';
import { Task, CheckableUserWithCustomers } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { getType, representsCustomers } from '../utils/UserUtils';
import {
  awaitsUserRatings,
  getMissingRepresentatives,
  missingDeveloper,
} from '../utils/TaskUtils';
import { apiV2 } from '../api/api';
import css from './TaskModalButtons.module.scss';

const classes = classNames.bind(css);

export const TaskModalButtons: FC<{
  task: Task;
  overview?: true;
}> = ({ task, overview }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { roadmapId } = task;
  const { data: customers } = apiV2.useGetCustomersQuery(roadmapId);
  const { data: allUsers } = apiV2.useGetRoadmapUsersQuery(roadmapId);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmapId);

  if (!userInfo || !allUsers) return null;

  const missingDevelopers = allUsers
    .filter(missingDeveloper(task))
    .map((user) => ({ ...user, checked: false }));
  const usersWithCustomers: CheckableUserWithCustomers[] = [];
  customers?.forEach((customer) => {
    getMissingRepresentatives(customer, allUsers, task).forEach(
      (representative) => {
        if (representative.id === userInfo.id) return;

        const foundIndex = usersWithCustomers.findIndex(
          (user) => user.id === representative.id,
        );
        if (foundIndex === -1)
          usersWithCustomers.push({
            ...representative,
            customers: [customer],
            checked: false,
          });
        else usersWithCustomers[foundIndex].customers?.push(customer);
      },
    );
  });

  const openModal = (payload: ShowModalPayload) => (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(modalsActions.showModal(payload));
  };

  const openNotifyModal = openModal({
    modalType: ModalTypes.NOTIFY_USERS_MODAL,
    modalProps: {
      taskId: task.id,
      missingUsers: usersWithCustomers,
      missingDevelopers,
    },
  });

  const openRateModal = openModal({
    modalType: ModalTypes.RATE_TASK_MODAL,
    modalProps: { taskId: task.id, edit: false },
  });

  const awaitsRatings = awaitsUserRatings(userInfo, roadmapId, customers)(task);
  if (overview && !awaitsRatings) return null;

  return (
    <div className={classes(css.buttonsContainer)}>
      {type === RoleType.Admin &&
        (usersWithCustomers.length > 0 || missingDevelopers.length > 0) && (
          <button
            className={classes(css['button-small-outlined'])}
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
            className={classes(css['button-small-filled'])}
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
