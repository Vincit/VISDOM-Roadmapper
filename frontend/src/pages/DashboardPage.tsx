import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { PlannerChart } from '../components/PlannerChart';
import { RoadmapCompletionMeter } from '../components/RoadmapCompletionMeter';
import { RoadmapOverview } from '../components/RoadmapOverview';
import { TaskHeatmap } from '../components/TaskHeatmap';
import { TaskTableUnrated } from '../components/TaskTable';
import { StoreDispatchType } from '../redux';
import { InfoTooltip } from '../components/InfoTooltip';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { roadmapsActions } from '../redux/roadmaps';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { isUnrated } from '../utils/TaskUtils';
import { getType } from '../utils/UserUtils';
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
  const roadmapsVersions = currentRoadmap?.versions;
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

  useEffect(() => {
    if (!roadmapsVersions && currentRoadmap)
      dispatch(roadmapsActions.getVersions(currentRoadmap.id));
  }, [currentRoadmap, dispatch, roadmapsVersions]);

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
  }, [dispatch, roadmapsVersions, currentRoadmap]);

  return (
    <>
      <div className={classes(css.overviewHeader)}>
        <h2>
          <Trans i18nKey="Welcome user">
            <span style={{ fontWeight: 'normal' }}>Welcome, </span>
            {{ name: userInfo?.username }}
          </Trans>
        </h2>
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
      {getUnratedTasks().length > 0 && (
        <div className={classes(css.taskTableWrapper)}>
          <div className={classes(css.titleContainer)}>
            <h2 className={classes(css.title)}>
              <Trans i18nKey="Unrated tasks" />
            </h2>
            <InfoTooltip title={t('tooltipMessage')}>
              <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
            </InfoTooltip>
          </div>
          <TaskTableUnrated tasks={getUnratedTasks()} />
        </div>
      )}
    </>
  );
};
