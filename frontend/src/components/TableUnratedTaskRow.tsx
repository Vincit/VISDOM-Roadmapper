/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useEffect } from 'react';
import BuildIcon from '@material-ui/icons/Build';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import Tooltip from '@material-ui/core/Tooltip';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StylesProvider } from '@material-ui/core/styles';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { Task, Customer, RoadmapUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';
import {
  roadmapUsersSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import { Dot } from './Dot';
import { getType } from '../utils/UserUtils';
import css from './TableUnratedTaskRow.module.scss';
import { taskAwaitsRatings, totalRatingsByDimension } from '../utils/TaskUtils';

const classes = classNames.bind(css);

interface TableTaskRowProps {
  task: Task;
}

export const TableUnratedTaskRow: React.FC<TableTaskRowProps> = ({ task }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { name, roadmapId } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo?.roles, roadmapId);
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const allCustomers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const [missingRatings, setMissingRatings] = useState<Customer[] | undefined>(
    undefined,
  );
  const [missingDevRatings, setMissingDevRatings] = useState<
    RoadmapUser[] | undefined
  >([]);
  const [userRatingMissing, setUserRatingMissing] = useState<boolean>(true);

  const totalRatings = totalRatingsByDimension(task);
  const noRatings = { sum: 0, count: 1 };
  const valueRatings =
    totalRatings.get(TaskRatingDimension.BusinessValue) ?? noRatings;
  const workRatings =
    totalRatings.get(TaskRatingDimension.RequiredWork) ?? noRatings;

  /*
    AdminUsers can see missing customer and developer ratings
    BusinessUser can see their missing customer ratings
    DeveloperUser can see missing developer ratings
    CustomerUser can see their own missing ratings
  */
  useEffect(() => {
    if (type === RoleType.Admin) {
      const ratings = task.ratings.map((rating) => ({
        createdByUser: rating.createdByUser,
        forCustomer: rating.forCustomer,
      }));

      const unratedCustomers = allCustomers?.filter((customer) => {
        const representativeIds = customer?.representatives?.map(
          (rep) => rep.id,
        );

        return !representativeIds?.every((rep) => {
          return ratings.some((rating) => {
            if (
              rating.createdByUser === rep &&
              rating.forCustomer === customer.id
            )
              return true;
            return false;
          });
        });
      });
      setMissingRatings(unratedCustomers);
    }

    if (type === RoleType.Admin || type === RoleType.Developer) {
      const ratingIds = task.ratings.map((rating) => rating.createdByUser);
      const developers = allUsers?.filter(
        (user) => user.type === RoleType.Developer,
      );
      const missingDevs = developers?.filter(
        (developer) => !ratingIds.includes(developer.id),
      );
      setMissingDevRatings(missingDevs);
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

  const openModal = (modalType: ModalTypes) => (e: React.SyntheticEvent) => {
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

  const numFormat = (num: number) => {
    if (Number.isNaN(num)) return 0;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  };

  return (
    <tr
      className={classes(css.styledTr, css.clickable)}
      onClick={openModal(ModalTypes.TASK_INFO_MODAL)}
    >
      <td className={classes(css.taskTitle)}>{name}</td>
      <td className={classes(css.unratedTd)}>
        {numFormat(valueRatings.sum / valueRatings.count)}
      </td>
      <td className={classes(css.unratedTd)}>
        {numFormat(workRatings.sum / workRatings.count)}
      </td>
      <td className={classes(css.unratedTd)}>
        <div className={classes(css.missingContainer)}>
          <StylesProvider injectFirst>
            {missingRatings && (
              <div className={classes(css.missingContainer)}>
                {missingRatings.map((customer) => (
                  <div key={customer.id}>
                    <Tooltip
                      classes={{
                        arrow: classes(css.tooltipArrow),
                        tooltip: classes(css.tooltip),
                      }}
                      title={customer.name}
                      placement="top"
                      arrow
                    >
                      <div className={classes(css.dotContainer)}>
                        <Dot fill={customer.color || 'red'} />
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
            {missingDevRatings && (
              <div>
                {missingDevRatings.map((dev) => (
                  <Tooltip
                    classes={{
                      arrow: classNames(css.tooltipArrow),
                      tooltip: classNames(css.tooltip),
                    }}
                    key={dev.username}
                    title={dev.username}
                    placement="top"
                    arrow
                  >
                    <BuildIcon className={classes(css.developerIcon)} />
                  </Tooltip>
                ))}
              </div>
            )}
            {userRatingMissing && type === RoleType.Customer && (
              <div>
                <Tooltip
                  classes={{
                    arrow: classNames(css.tooltipArrow),
                    tooltip: classNames(css.tooltip),
                  }}
                  key={userInfo?.username}
                  title={userInfo?.username || ''}
                  placement="top"
                  arrow
                >
                  <PermIdentityIcon className={classes(css.userIcon)} />
                </Tooltip>
              </div>
            )}
          </StylesProvider>
        </div>
      </td>
      <td className={classes(css.buttonContainer)}>
        {type === RoleType.Admin && (
          <button
            style={{ marginRight: '10px' }}
            className={classes(css['button-small-outlined'])}
            type="button"
            /* onClick={openModal(ModalTypes.NOTIFY_USERS_MODAL)} */
          >
            <Trans i18nKey="Notify" />
          </button>
        )}
        {taskAwaitsRatings(task, userInfo) ? (
          <button
            className={classes(css['button-small-filled'])}
            type="button"
            onClick={openModal(ModalTypes.RATE_TASK_MODAL)}
          >
            <Trans i18nKey="Rate" />
          </button>
        ) : (
          <button
            className={classes(css['button-small-filled'])}
            type="button"
            disabled
          >
            <Trans i18nKey="Rate" />
          </button>
        )}
      </td>
    </tr>
  );
};
