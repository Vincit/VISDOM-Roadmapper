import { FC } from 'react';
import classNames from 'classnames';
import PeopleIcon from '@mui/icons-material/People';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Trans } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { paths } from '../routers/paths';
import { ReactComponent as DashboardIcon } from '../icons/dashboard_icon.svg';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
import css from './RoadmapSidebar.module.scss';
import { userRoleSelector } from '../redux/user/selectors';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { RoleType, Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { apiV2, selectById } from '../api/api';

const classes = classNames.bind(css);

export const RoadmapSidebar: FC = () => {
  const { pathname } = useLocation();
  const role = useSelector(userRoleSelector, shallowEqual);
  const hasReadVersionPermission = hasPermission(role, Permission.VersionRead);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: roadmap, isFetching } = apiV2.useGetRoadmapsQuery(undefined, {
    ...selectById(roadmapId),
    skip: !roadmapId,
  });
  if (!roadmapId || (!roadmap && !isFetching)) return null;

  const url = `/roadmap/${roadmapId}`;

  const renderButtons = () => {
    return (
      <>
        <Link
          to={url + paths.roadmapRelative.dashboard}
          className={classes(css.navButton, {
            [css.selected]: pathname.startsWith(
              url + paths.roadmapRelative.dashboard,
            ),
          })}
        >
          <DashboardIcon />
          <Trans i18nKey="Dashboard" />
        </Link>
        <Link
          to={url + paths.roadmapRelative.tasks + paths.tasksRelative.tasklist}
          className={classes(css.navButton, {
            [css.selected]: pathname.startsWith(
              url + paths.roadmapRelative.tasks,
            ),
          })}
        >
          <ListIcon />
          <Trans i18nKey="Tasks" />
        </Link>
        {(role === RoleType.Admin || role === RoleType.Business) && (
          <Link
            to={url + paths.roadmapRelative.clients}
            className={classes(css.navButton, {
              [css.selected]: pathname.startsWith(
                url + paths.roadmapRelative.clients,
              ),
            })}
          >
            <PeopleIcon />
            <Trans i18nKey="Clients" />
          </Link>
        )}
        {role === RoleType.Admin && (
          <Link
            to={url + paths.roadmapRelative.team}
            className={classes(css.navButton, {
              [css.selected]: pathname.startsWith(
                url + paths.roadmapRelative.team,
              ),
            })}
          >
            <DashboardIcon />
            <Trans i18nKey="Team" />
          </Link>
        )}
        {hasReadVersionPermission && (
          <Link
            to={
              url + paths.roadmapRelative.planner + paths.plannerRelative.editor
            }
            className={classes(css.navButton, {
              [css.selected]: pathname.startsWith(
                url + paths.roadmapRelative.planner,
              ),
            })}
          >
            <TimelineIcon />
            <Trans i18nKey="Plan" />
          </Link>
        )}
        {role === RoleType.Admin && (
          <Link
            to={url + paths.roadmapRelative.settings}
            className={classes(css.navButton, css.settings, {
              [css.selected]: pathname.startsWith(
                url + paths.roadmapRelative.settings,
              ),
            })}
          >
            <SettingsIcon />
            <Trans i18nKey="Settings" />
          </Link>
        )}
      </>
    );
  };

  return (
    <div className={classes(css.container)}>
      <div className={classes(css.navButton, css.logo)}>
        <Link to={paths.overview} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
      </div>
      <div className={classes(css.buttonsContainer)}>{renderButtons()}</div>
    </div>
  );
};
