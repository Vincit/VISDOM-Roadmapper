import { shallowEqual, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import css from './RoadmapOverview.module.scss';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { milestoneRatingSummary } from '../utils/TaskUtils';
import { MetricsSummary } from './MetricsSummary';
import colors from '../colors.module.scss';
import { apiV2 } from '../api/api';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { getType } from '../utils/UserUtils';
import { UserInfo } from '../redux/user/types';
import { userInfoSelector } from '../redux/user/selectors';
import { RootState } from '../redux/types';

const classes = classNames.bind(css);

export const RoadmapOverview = () => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmapId);
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
    {
      skip: !hasPermission(type, Permission.VersionRead),
    },
  );
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);

  const summary = milestoneRatingSummary(tasks ?? []);

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
      metricsValue: summary.value('avg').avg,
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: 'Avg Complexity',
      metricsValue: summary.complexity().avg,
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
