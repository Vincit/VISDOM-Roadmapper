import React, { useState } from 'react';
import classNames from 'classnames';
import { StylesProvider } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import FavoriteSharpIcon from '@material-ui/icons/FavoriteSharp';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Customer, Roadmap, RoadmapUser } from '../redux/roadmaps/types';
import { MetricsSummary } from './MetricsSummary';
import { MoreButton } from './forms/SvgButton';
import { isCustomer } from '../utils/CustomerUtils';
import { paths } from '../routers/paths';
import css from './ProjectSummary.module.scss';

const classes = classNames.bind(css);

const ProjectMenu: React.FC<{
  roadmapId: number;
  anchorEl: (EventTarget & Element) | null;
  open: boolean;
  onClose: () => void;
}> = ({ roadmapId, anchorEl, open, onClose }) => (
  <StylesProvider injectFirst>
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
        >
          <Trans i18nKey="Set as default project" />
        </button>
        {/* TODO: href to roadmap deletion modal */}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className={classes(css.green)}>
          <Trans i18nKey="Delete project" />
        </a>
      </div>
    </Popover>
  </StylesProvider>
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
