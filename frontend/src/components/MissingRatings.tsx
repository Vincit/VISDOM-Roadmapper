import { useState, useEffect, FC } from 'react';
import BuildIcon from '@material-ui/icons/Build';
import Tooltip from '@material-ui/core/Tooltip';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
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
import { getType } from '../utils/UserUtils';
import {
  missingCustomer,
  missingDeveloper,
  ratedByCustomer,
} from '../utils/TaskUtils';
import css from './MissingRatings.module.scss';

const classes = classNames.bind(css);

export const MissingRatings: FC<{
  task: Task;
  label?: true;
}> = ({ task, label }) => {
  const { roadmapId } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmapId);
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

  /*
    AdminUsers can see missing customer and developer ratings
    BusinessUser can see their missing customer ratings
    DeveloperUser can see missing developer ratings
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
          (customer) =>
            roadmapId === customer.roadmapId &&
            !ratedByCustomer(customer, userInfo)(task),
        ),
      );
    }
  }, [task, allCustomers, allUsers, userInfo, type, roadmapId]);

  const Icons = () => (
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
      {missingDevRatings &&
        missingDevRatings.map(({ email }) => (
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
  );

  if (!label) return <Icons />;
  return (
    <div className={classes(css.withLabel)}>
      {missingDevRatings?.length || missingRatings?.length ? (
        <Trans i18nKey="Waiting for ratings" />
      ) : (
        <Trans i18nKey="No ratings waiting" />
      )}
      <Icons />
    </div>
  );
};