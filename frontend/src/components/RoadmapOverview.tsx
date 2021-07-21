import React from 'react';
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
import { MetricsSummary } from './MetricsSummary';

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
    <div className={classes(css.data)}>
      <MetricsSummary label="Tasks" value={roadmapTasksCount()} />
      <MetricsSummary label="Milestones" value={roadmapMilestonesCount()} />
      <MetricsSummary label="Avg Value" value={numFormat.format(value)}>
        <MonetizationOnIcon />
      </MetricsSummary>
      <MetricsSummary label="Avg Work" value={numFormat.format(work)}>
        <WorkIcon />
      </MetricsSummary>
    </div>
  );
};
