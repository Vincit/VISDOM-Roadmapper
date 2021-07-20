import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import css from './RoadmapOverview.module.scss';
import { ReactComponent as WorkIcon } from '../icons/rate_work.svg';
import { averageValueAndWork } from '../utils/TaskUtils';

const classes = classNames.bind(css);

export const RoadmapOverview = () => {
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const roadmapTasksCount = () => {
    return roadmap!.tasks.length;
  };

  const roadmapMilestonesCount = () => {
    return roadmapsVersions?.length || 0;
  };

  const { value, work } = averageValueAndWork(roadmap?.tasks ?? []);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className={classes(css.dataFlexbox)}>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="Tasks" />
        <div className={classes(css.dash)} />
        <p className={classes(css.dataNumberWrapper)}>{roadmapTasksCount()}</p>
      </div>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="milestones" />
        <div className={classes(css.dash)} />
        <p className={classes(css.dataNumberWrapper)}>
          {roadmapMilestonesCount()}
        </p>
      </div>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="Avg Value" />
        <div className={classes(css.dash)} />
        <p className={classes(css.dataNumberWrapper)}>
          {numFormat.format(value)}
          <MonetizationOnIcon />
        </p>
      </div>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="Avg Work" />
        <div className={classes(css.dash)} />
        <p className={classes(css.dataNumberWrapper)}>
          {numFormat.format(work)}
          <WorkIcon />
        </p>
      </div>
    </div>
  );
};
