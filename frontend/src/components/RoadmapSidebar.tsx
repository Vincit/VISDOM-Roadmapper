import { FC } from 'react';
import classNames from 'classnames';
import PeopleIcon from '@material-ui/icons/People';
import ListIcon from '@material-ui/icons/List';
import SettingsIcon from '@material-ui/icons/Settings';
import TimelineIcon from '@material-ui/icons/Timeline';
import { Trans } from 'react-i18next';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { paths } from '../routers/paths';
import { ReactComponent as DashboardIcon } from '../icons/dashboard_icon.svg';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
import css from './RoadmapSidebar.module.scss';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { getType } from '../utils/UserUtils';

const classes = classNames.bind(css);

export const RoadmapSidebar: FC = () => {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const role = getType(userInfo?.roles, currentRoadmap?.id);

  if (!url.startsWith('/roadmap')) return null;

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
          to={url + paths.roadmapRelative.taskList}
          className={classes(css.navButton, {
            [css.selected]: pathname.startsWith(
              url + paths.roadmapRelative.taskList,
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
            <ListIcon />
            <Trans i18nKey="Clients" />
          </Link>
        )}
        {role === RoleType.Admin && (
          <>
            <Link
              to={url + paths.roadmapRelative.people}
              className={classes(css.navButton, {
                [css.selected]: pathname.startsWith(
                  url + paths.roadmapRelative.people,
                ),
              })}
            >
              <PeopleIcon />
              <Trans i18nKey="People" />
            </Link>
            <Link
              to={
                url +
                paths.roadmapRelative.planner +
                paths.plannerRelative.editor
              }
              className={classes(css.navButton, {
                [css.selected]: pathname.startsWith(
                  url + paths.roadmapRelative.planner,
                ),
              })}
            >
              <TimelineIcon />
              <Trans i18nKey="Plan" />
            </Link>{' '}
            <Link
              to={url + paths.roadmapRelative.configure}
              className={classes(css.navButton, css.settings, {
                [css.selected]: pathname.startsWith(
                  url + paths.roadmapRelative.configure,
                ),
              })}
            >
              <SettingsIcon />
              <Trans i18nKey="Settings" />
            </Link>
          </>
        )}
      </>
    );
  };

  return (
    <div className={classes('layout-column')}>
      <div className={classes(css.navButton, css.logo)}>
        <Link to={paths.overview} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
      </div>
      {renderButtons()}
    </div>
  );
};
