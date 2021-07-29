import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import Popover from '@material-ui/core/Popover';
import FavoriteSharpIcon from '@material-ui/icons/FavoriteSharp';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { Customer, Roadmap, RoadmapUser } from '../redux/roadmaps/types';
import { MetricsSummary } from './MetricsSummary';
import { MoreButton } from './forms/SvgButton';
import { isCustomer } from '../utils/CustomerUtils';
import { paths } from '../routers/paths';
import { modalLink, ModalTypes } from './modals/types';
import css from './ProjectSummary.module.scss';

const classes = classNames.bind(css);

const ProjectMenu: React.FC<{
  roadmapId: number;
  anchorEl: (EventTarget & Element) | null;
  open: boolean;
  onClose: () => void;
}> = ({ roadmapId, anchorEl, open, onClose }) => (
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
      {/* TODO: set as default project */}
      <button
        className={classes(css.linkButton, css.green)}
        tabIndex={0}
        type="button"
        onClick={() => onClose()}
      >
        <Trans i18nKey="Set as default project" />
      </button>
      <Link
        className={classes(css.green)}
        to={modalLink(ModalTypes.DELETE_ROADMAP_MODAL, { id: roadmapId })}
        onClick={() => onClose()}
      >
        <Trans i18nKey="Delete project ellipsis" />
      </Link>
    </div>
  </Popover>
);

const PeopleList: React.FC<{
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
          {isCustomer(person) ? person.name : person.username}
          {idx !== people.length - 1 && ', '}
        </span>
      ))}
    </div>
  </div>
);

export const ProjectSummary: React.FC<{
  roadmap: Roadmap;
  selected: boolean;
}> = ({ roadmap, selected }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLDivElement) | null
  >(null);
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!roadmap.customers) dispatch(roadmapsActions.getCustomers(roadmap.id));
    if (!roadmap.users) dispatch(roadmapsActions.getRoadmapUsers(roadmap.id));
  }, [dispatch, roadmap]);

  return (
    <div className={classes(css.roadmapSummary)}>
      <div className={classes(css.header)}>
        <div>{roadmap.name}</div>
        {/* TODO: add default project boolean to roadmap
        <div className={classes(css.defaultProject)}>
          <FavoriteSharpIcon fontSize="small" />
        </div>
        */}
        <div
          className={classes(css.moreButton)}
          role="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          onKeyPress={(e) => setAnchorEl(e.currentTarget)}
          tabIndex={0}
        >
          <MoreButton />
        </div>
        <ProjectMenu
          roadmapId={roadmap.id}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        />
      </div>
      <div className={classes(css.metrics)}>
        <MetricsSummary label={t('Tasks')} value={roadmap.tasks.length} />
        <MetricsSummary label={t('Milestones')} value="" />
      </div>
      {!!roadmap.customers?.length && (
        <PeopleList label="Clients" people={roadmap.customers} />
      )}
      {!!roadmap.users?.length && (
        <PeopleList label="Team members" people={roadmap.users} />
      )}
      {selected ? (
        <button className="button-large" type="button" disabled>
          <Trans i18nKey="Open" />
        </button>
      ) : (
        <Link
          className={classes(css.openButton)}
          to={`${paths.roadmapHome}/${roadmap.id}${paths.roadmapRelative.dashboard}`}
        >
          <Trans i18nKey="Open" />
        </Link>
      )}
    </div>
  );
};
