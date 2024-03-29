import { FC, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import Popover from '@mui/material/Popover';
import FavoriteSharpIcon from '@mui/icons-material/FavoriteSharp';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { Customer, Roadmap, RoadmapUser } from '../redux/roadmaps/types';
import { MetricsSummary } from './MetricsSummary';
import { MoreButton } from './forms/SvgButton';
import { isCustomer } from '../utils/CustomerUtils';
import { paths } from '../routers/paths';
import { modalLink, ModalTypes } from './modals/types';
import { getType } from '../utils/UserUtils';
import { Permission } from '../../../shared/types/customTypes';
import css from './ProjectSummary.module.scss';
import { RootState } from '../redux/types';
import { UserInfo } from '../redux/user/types';
import { userInfoSelector } from '../redux/user/selectors';
import { userActions } from '../redux/user';
import { hasPermission } from '../../../shared/utils/permission';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

const ProjectMenu: FC<{
  roadmapId: number;
  user: UserInfo;
  anchorEl: (EventTarget & Element) | null;
  open: boolean;
  onClose: () => void;
}> = ({ roadmapId, user, anchorEl, open, onClose }) => {
  const dispatch = useDispatch<StoreDispatchType>();

  const handleSelect = async (selected: boolean) => {
    // If current project is selected, pass undefined to patchDefaultRoadmap which unselects users current default roadmap
    await dispatch(
      userActions.patchDefaultRoadmap({
        userId: user.id,
        roadmapId: selected ? undefined : roadmapId,
      }),
    );
    await dispatch(userActions.getUserInfo());
    onClose();
  };

  return (
    <Popover
      classes={{
        paper: classes(css.projectMenu),
      }}
      id={open ? 'project-menu' : undefined}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <div className={classes(css.content)}>
        <button
          className={classes(css.linkButton, css.green)}
          tabIndex={0}
          type="button"
          onClick={() => handleSelect(user.defaultRoadmapId === roadmapId)}
        >
          {user.defaultRoadmapId === roadmapId ? (
            <Trans i18nKey="Unselect default project" />
          ) : (
            <Trans i18nKey="Set as a default project" />
          )}
        </button>
        {hasPermission(getType(user, roadmapId), Permission.RoadmapDelete) && (
          <Link
            className={classes(css.green)}
            to={modalLink(ModalTypes.DELETE_ROADMAP_MODAL, {
              id: roadmapId,
            })}
            onClick={() => onClose()}
          >
            <Trans i18nKey="Delete project ellipsis" />
          </Link>
        )}
      </div>
    </Popover>
  );
};

const PeopleList: FC<{
  label: string;
  people: Customer[] | RoadmapUser[];
}> = ({ people, label }) => (
  <div>
    <div className={classes(css.peopleHeader)}>
      <Trans i18nKey={label} />
    </div>
    <div className={classes(css.people)}>
      {people.map((person, idx) => (
        <span key={person.id}>
          {isCustomer(person) ? person.name : person.email}
          {idx !== people.length - 1 && ', '}
        </span>
      ))}
    </div>
  </div>
);

export const ProjectSummary: FC<{
  roadmap: Roadmap;
}> = ({ roadmap }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLDivElement) | null
  >(null);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmap.id);
  const { data: customers } = apiV2.useGetCustomersQuery(roadmap.id);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmap.id);
  const { data: versions } = apiV2.useGetVersionsQuery(roadmap.id, {
    skip: !hasPermission(type, Permission.VersionRead),
  });
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmap.id, {
    skip: !hasPermission(type, Permission.RoadmapReadUsers),
  });

  return (
    <div className={classes(css.roadmapSummary)}>
      <div className={classes(css.header)}>
        <div className={classes(css.roadmapName)}>{roadmap.name}</div>
        {userInfo?.defaultRoadmapId === roadmap.id && (
          <div className={classes(css.defaultProject)}>
            <FavoriteSharpIcon fontSize="small" />
          </div>
        )}
        <div
          className={classes(css.rightSide)}
          role="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          onKeyPress={(e) => setAnchorEl(e.currentTarget)}
          tabIndex={0}
        >
          <MoreButton />
        </div>
        {userInfo && (
          <ProjectMenu
            roadmapId={roadmap.id}
            user={userInfo}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          />
        )}
      </div>
      <div className={classes(css.metrics)}>
        <MetricsSummary label={t('Tasks')} value={tasks?.length ?? 0} />
        <MetricsSummary label={t('Milestones')} value={versions?.length ?? 0} />
      </div>
      {!!customers?.length && <PeopleList label="Clients" people={customers} />}
      {!!users?.length && <PeopleList label="Team members" people={users} />}
      <Link
        className={classes(css.openButton)}
        to={`${paths.roadmapHome}/${roadmap.id}${paths.roadmapRelative.dashboard}`}
      >
        <Trans i18nKey="Open" />
      </Link>
    </div>
  );
};
