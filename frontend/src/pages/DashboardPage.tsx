import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { PlannerChart } from '../components/PlannerChart';
import { RoadmapCompletionMeter } from '../components/RoadmapCompletionMeter';
import { RoadmapOverview } from '../components/RoadmapOverview';
import { TaskHeatmap } from '../components/TaskHeatmap';
import { TaskTableUnrated } from '../components/TaskTableUnrated';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { awaitsUserRatings } from '../utils/TaskUtils';
import { getType } from '../utils/UserUtils';
import css from './DashboardPage.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

interface VersionListsObject {
  [K: string]: Task[];
}
const ROADMAP_LIST_ID = '-1';

export const DashboardPage = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const roadmapId = useSelector(chosenRoadmapIdSelector)!;
  const { data: roadmapTasks } = apiV2.useGetTasksQuery(roadmapId);
  const type = getType(userInfo, roadmapId);
  // FIXME: check permission: hasPermission(type, Permission.VersionRead)
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(roadmapId);
  const { data: customers } = apiV2.useGetCustomersQuery(roadmapId);
  const [chartVersionLists, setChartVersionLists] = useState<
    {
      name: string;
      sortingRank: number;
      tasks: Task[];
    }[]
  >([]);
  const [unratedTasks, setUnratedTasks] = useState<Task[]>([]);

  // TODO move duplicate version organizing / charting logic into custom hook
  useEffect(() => {
    if (roadmapsVersions === undefined) return;

    const versionLists: VersionListsObject = {};
    versionLists[ROADMAP_LIST_ID] = [];
    roadmapsVersions.forEach((v) => {
      versionLists[v.id] = v.tasks;
    });

    const chartVersions = Object.entries(versionLists)
      .filter(([key, tasks]) => key !== ROADMAP_LIST_ID && tasks.length > 0)
      .flatMap(([key, tasks]) => {
        const version = roadmapsVersions.find((ver) => ver.id === +key);
        if (!version) return [];
        return [
          {
            name: version.name,
            sortingRank: version.sortingRank,
            tasks,
          },
        ];
      })
      .sort((a, b) => a.sortingRank - b.sortingRank);

    setChartVersionLists(chartVersions);
  }, [roadmapsVersions, roadmapId]);

  useEffect(() => {
    if (userInfo && roadmapId && roadmapTasks !== undefined) {
      setUnratedTasks(
        roadmapTasks.filter(awaitsUserRatings(userInfo, roadmapId, customers)),
      );
    }
  }, [customers, roadmapId, roadmapTasks, userInfo]);

  return (
    <>
      <div className={classes(css.overviewHeader)}>
        <h2>
          <Trans i18nKey="Welcome user">
            <span style={{ fontWeight: 'normal' }}>Welcome, </span>
            {{ name: userInfo?.email /* XXX */ }}
          </Trans>
        </h2>
        <RoadmapOverview />
      </div>
      {type === RoleType.Admin && (
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
      {unratedTasks.length > 0 && (
        <div className={classes(css.taskTableWrapper)}>
          <TaskTableUnrated items={unratedTasks} />
        </div>
      )}
    </>
  );
};
