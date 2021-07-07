import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { PlannerChart } from '../components/PlannerChart';
import { RoadmapCompletionMeter } from '../components/RoadmapCompletionMeter';
import { RoadmapOverview } from '../components/RoadmapOverview';
import { TaskHeatmap } from '../components/TaskHeatmap';
import { TaskTable } from '../components/TaskTable';
import { StoreDispatchType } from '../redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { isUnrated } from '../utils/TaskUtils';
import { versionsActions } from '../redux/versions';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { getType } from '../utils/UserUtils';
import { TooltipIcon } from '../components/forms/TooltipIcon';

import css from './DashboardPage.module.scss';

const classes = classNames.bind(css);

interface VersionListsObject {
  [K: string]: Task[];
}
const ROADMAP_LIST_ID = '-1';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const [chartVersionLists, setChartVersionLists] = useState<
    {
      name: string;
      sortingRank: number;
      tasks: Task[];
    }[]
  >([]);

  const getUnratedTasks = () => {
    if (!currentRoadmap || !userInfo) return [];
    return currentRoadmap.tasks.filter(isUnrated(userInfo));
  };

  // TODO move duplicate version organizing / charting logic into custom hook
  useEffect(() => {
    if (roadmapsVersions === undefined) {
      dispatch(versionsActions.getVersions(currentRoadmap!.id));
      return;
    }
    const versionLists: VersionListsObject = {};
    versionLists[ROADMAP_LIST_ID] = [];
    roadmapsVersions.forEach((v) => {
      versionLists[v.id] = v.tasks;
    });

    const chartVersions = Object.keys(versionLists)
      .filter(
        (key) =>
          key !== ROADMAP_LIST_ID &&
          versionLists[key].length > 0 &&
          roadmapsVersions!.find((ver) => ver.id === +key),
      )
      .map((key) => {
        const version = roadmapsVersions!.find((ver) => ver.id === +key)!;
        return {
          name: version!.name,
          sortingRank: version.sortingRank,
          tasks: versionLists[key],
        };
      })
      .sort((a, b) => a.sortingRank - b.sortingRank);

    setChartVersionLists(chartVersions);
  }, [dispatch, roadmapsVersions, currentRoadmap]);

  return (
    <>
      <div className={classes(css.overviewHeader)}>
        <p className={classes(css.welcomemessage)}>
          Welcome{' '}
          <span className={classes(css.usernameSpan)}>
            @{userInfo!.username}
          </span>
        </p>
        <p className={classes(css.taskmessage)}>
          You have{' '}
          <span className={classes(css.taskCountSpan)}>
            {getUnratedTasks().length}
          </span>{' '}
          new tasks to rate →
        </p>
        <RoadmapOverview />
      </div>
      {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin && (
        <div className={classes(css.chartFlexbox)}>
          <div className={classes(css.meterWrapper)}>
            <TaskHeatmap />
          </div>
          <div className={classes(css.chartWrapper)}>
            <PlannerChart versions={chartVersionLists} hideButtons />
          </div>
          <div className={classes(css.meterWrapper)}>
            <RoadmapCompletionMeter />
          </div>
        </div>
      )}
      <div className={classes(css.taskTableWrapper)}>
        <div className={classes(css.titleContainer)}>
          <h2 className={classes(css.title)}>
            <Trans i18nKey="Unrated tasks" />
          </h2>
          <TooltipIcon title={t('tooltipMessage')}>
            <InfoIcon className={classes(css.tooltipInfoIcon, css.infoIcon)} />
          </TooltipIcon>
        </div>

        <TaskTable tasks={getUnratedTasks()} nofilter />
      </div>
    </>
  );
};
