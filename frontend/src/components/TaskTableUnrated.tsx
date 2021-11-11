/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { SyntheticEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BuildIcon from '@material-ui/icons/Build';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import Tooltip from '@material-ui/core/Tooltip';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { InfoTooltip } from './InfoTooltip';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { Customer, RoadmapUser, Task } from '../redux/roadmaps/types';
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
  awaitsUserRatings,
  averageValueAndWork,
  missingCustomer,
  missingDeveloper,
  SortingTypes,
  ratedByUser,
  ratedByCustomer,
  taskSort,
} from '../utils/TaskUtils';
import { table, TableRow } from './Table';
import { paths } from '../routers/paths';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TableUnratedTaskRow: TableRow<Task> = ({ item: task, style }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { name, roadmapId } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmapId);
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
      setMissingRatings(allCustomers.filter(missingCustomer(task)));
    }

    if ((type === RoleType.Admin || type === RoleType.Developer) && allUsers) {
      setMissingDevRatings(allUsers.filter(missingDeveloper(task)));
    }

    if (type === RoleType.Business) {
      setMissingRatings(
        userInfo?.representativeFor?.filter(
          (customer) => !ratedByCustomer(customer, userInfo)(task),
        ),
      );
    }

    if (type === RoleType.Customer && userInfo) {
      // if task doesn't have ratings from the user that is logged in, display icon to them.
      setUserRatingMissing(!ratedByUser(userInfo)(task));
    }
  }, [task, allCustomers, allUsers, userInfo, type]);

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
    <Link
      className={classes(css.navBarLink, css.hoverRow)}
      to={`${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.taskList}/${task.id}`}
    >
      <div style={style} className={classes(css.virtualizedTableRow)}>
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
                {missingDevRatings.map(({ email }) => (
                  <Tooltip
                    classes={{
                      arrow: classes(css.tooltipArrow),
                      tooltip: classes(css.tooltip),
                    }}
                    key={email}
                    title={email}
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
                key={userInfo?.email}
                title={userInfo?.email || ''}
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
              representsCustomers(userInfo, roadmapId)) && (
              <button
                className={classes(css['button-small-filled'])}
                type="button"
                disabled={!awaitsUserRatings(userInfo, roadmapId)(task)}
                onClick={openModal(ModalTypes.RATE_TASK_MODAL)}
              >
                <Trans i18nKey="Rate" />
              </button>
            )}
          <ArrowForwardIcon className={classes(css.arrowIcon)} />
        </div>
      </div>
    </Link>
  );
};

export const TaskTableUnrated = table({
  Title: ({ count }) => (
    <>
      <h2 className={classes(css.title)}>
        <Trans i18nKey="unratedTaskMessage" /> ({count})
      </h2>
      <InfoTooltip title={<Trans i18nKey="tooltipMessage" />}>
        <InfoIcon className={classes(css.tooltipIcon)} />
      </InfoTooltip>
    </>
  ),
  Row: TableUnratedTaskRow,
  getSort: taskSort,
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
