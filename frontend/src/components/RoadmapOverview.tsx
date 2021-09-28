import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  chosenRoadmapSelector,
  roadmapsVersionsSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap, Version } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import css from './RoadmapOverview.module.scss';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { averageValueAndWork } from '../utils/TaskUtils';
import { MetricsSummary } from './MetricsSummary';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

export const RoadmapOverview = () => {
  const { t } = useTranslation();
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector(),
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
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: 'Avg Work',
      metricsValue: numFormat.format(work),
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
