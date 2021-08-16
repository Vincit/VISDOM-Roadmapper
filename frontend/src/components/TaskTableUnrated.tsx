/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { SyntheticEvent, useState, useEffect } from 'react';
import BuildIcon from '@material-ui/icons/Build';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import Tooltip from '@material-ui/core/Tooltip';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import {
  roadmapUsersSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import { Dot } from './Dot';
import { getType, representsCustomers } from '../utils/UserUtils';
import css from './TaskTable.module.scss';
import {
  taskAwaitsRatings,
  averageValueAndWork,
  findMissingCustomers,
  findMissingDevelopers,
  SortingTypes,
} from '../utils/TaskUtils';
import { taskTable, TaskRow } from './TaskTable';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TableUnratedTaskRow: TaskRow = ({ task, style }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { name, roadmapId } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo?.roles, roadmapId);
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const allCustomers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const [missingRatings, setMissingRatings] = useState<Customer[] | undefined>(
    undefined,
  );
  const [missingDevRatings, setMissingDevRatings] = useState<
    RoadmapUser[] | undefined
  >([]);
  const [userRatingMissing, setUserRatingMissing] = useState<boolean>(true);

  const { value, work } = averageValueAndWork([task]);

  /*
    AdminUsers can see missing customer and developer ratings
    BusinessUser can see their missing customer ratings
    DeveloperUser can see missing developer ratings
    CustomerUser can see their own missing ratings
  */
  useEffect(() => {
    if (type === RoleType.Admin && allCustomers) {
      const unratedCustomers = findMissingCustomers(task.ratings, allCustomers);
      setMissingRatings(unratedCustomers);
    }

    if ((type === RoleType.Admin || type === RoleType.Developer) && allUsers) {
      const missingDevelopers = findMissingDevelopers(task.ratings, allUsers);
      setMissingDevRatings(missingDevelopers);
    }

    if (type === RoleType.Business) {
      const unratedCustomers = userInfo?.representativeFor?.filter(
        (customer) =>
          !task.ratings.some(
            (rating) =>
              customer.id === rating.forCustomer &&
              rating.createdByUser === userInfo?.id,
          ),
      );
      setMissingRatings(unratedCustomers);
    }

    if (type === RoleType.Customer) {
      // if task doesn't have ratings from the user that is logged in, display icon to them.
      setUserRatingMissing(
        !task.ratings.some((rating) => rating.createdByUser === userInfo?.id),
      );
    }
  }, [task.ratings, allCustomers, allUsers, userInfo, type, task.roadmapId]);

  const openModal = (
    modalType:
      | ModalTypes.EDIT_TASK_MODAL
      | ModalTypes.RATE_TASK_MODAL
      | ModalTypes.TASK_RATINGS_INFO_MODAL
      | ModalTypes.TASK_INFO_MODAL
      | ModalTypes.NOTIFY_USERS_MODAL,
  ) => (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  return (
    <div style={style} className={classes(css.taskTableRow)}>
      <div className={classes(css.taskTitle)}>{name}</div>
      <div>{numFormat.format(value)}</div>
      <div>{numFormat.format(work)}</div>
      <div>
        <div className={classes(css.missingContainer)}>
          {missingRatings?.map((customer) => (
            <Tooltip
              classes={{
                arrow: classes(css.tooltipArrow),
                tooltip: classes(css.tooltip),
              }}
              key={customer.id}
              title={customer.name}
              placement="top"
              arrow
            >
              <div className={classes(css.dotContainer)}>
                <Dot fill={customer.color} />
              </div>
            </Tooltip>
          ))}
          {missingDevRatings && (
            <div>
              {missingDevRatings.map(({ username }) => (
                <Tooltip
                  classes={{
                    arrow: classes(css.tooltipArrow),
                    tooltip: classes(css.tooltip),
                  }}
                  key={username}
                  title={username}
                  placement="top"
                  arrow
                >
                  <BuildIcon className={classes(css.developerIcon)} />
                </Tooltip>
              ))}
            </div>
          )}
          {userRatingMissing && type === RoleType.Customer && (
            <Tooltip
              classes={{
                arrow: classes(css.tooltipArrow),
                tooltip: classes(css.tooltip),
              }}
              key={userInfo?.username}
              title={userInfo?.username || ''}
              placement="top"
              arrow
            >
              <PermIdentityIcon className={classes(css.userIcon)} />
            </Tooltip>
          )}
        </div>
      </div>
      <div className={classes(css.buttonContainer)}>
        {type === RoleType.Admin && (
          <button
            style={{ marginRight: '10px' }}
            className={classes(css['button-small-outlined'])}
            type="button"
            onClick={openModal(ModalTypes.NOTIFY_USERS_MODAL)}
          >
            <Trans i18nKey="Notify" />
          </button>
        )}
        {userInfo &&
          (type === RoleType.Developer ||
            representsCustomers(userInfo, task.roadmapId)) && (
            <button
              className={classes(css['button-small-filled'])}
              type="button"
              disabled={!taskAwaitsRatings(task, userInfo)}
              onClick={openModal(ModalTypes.RATE_TASK_MODAL)}
            >
              <Trans i18nKey="Rate" />
            </button>
          )}
      </div>
    </div>
  );
};

export const TaskTableUnrated = taskTable({
  title: 'unratedTaskMessage',
  Row: TableUnratedTaskRow,
  header: [
    { label: 'Task title', width: '2fr', sorting: SortingTypes.SORT_NAME },
    {
      label: 'Current average value',
      width: '0.5fr',
      sorting: SortingTypes.SORT_AVG_VALUE,
    },
    {
      label: 'Current average work',
      width: '0.5fr',
      sorting: SortingTypes.SORT_AVG_WORK,
    },
    { label: 'Waiting for ratings' },
    { label: '' },
  ],
});
