import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );

  const { value, work } = averageValueAndWork(roadmap?.tasks ?? []);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const metrics = [
    {
      label: 'Tasks',
      metricsValue: roadmap?.tasks.length ?? 0,
    },
    {
      label: 'Milestones',
      metricsValue: roadmapsVersions?.length ?? 0,
    },
    {
      label: 'Avg Value',
      metricsValue: numFormat.format(value),
      children: <MonetizationOnIcon />,
    },
    {
      label: 'Avg Work',
      metricsValue: numFormat.format(work),
      children: <WorkIcon />,
    },
  ];

  return (
    <div className={classes(css.data)}>
      {metrics.map(({ label, metricsValue, children }) => (
        <MetricsSummary key={label} label={t(label)} value={metricsValue}>
          {children}
        </MetricsSummary>
      ))}
    </div>
  );
};
