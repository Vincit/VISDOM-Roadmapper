import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import css from './RoadmapOverview.module.scss';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { averageValueAndComplexity } from '../utils/TaskUtils';
import { MetricsSummary } from './MetricsSummary';
import colors from '../colors.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const RoadmapOverview = () => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
  );
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);

  const { value, complexity } = averageValueAndComplexity(tasks ?? []);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const metrics = [
    {
      label: 'Tasks',
      metricsValue: tasks?.length ?? 0,
    },
    {
      label: 'Milestones',
      metricsValue: roadmapsVersions?.length ?? 0,
    },
    {
      label: 'Avg Value',
      metricsValue: numFormat.format(value),
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: 'Avg Complexity',
      metricsValue: numFormat.format(complexity),
      children: <WorkRoundIcon color={colors.black100} />,
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
