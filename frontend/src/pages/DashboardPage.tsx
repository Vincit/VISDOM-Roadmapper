import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
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
import { versionsActions } from '../redux/versions';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';

interface VersionListsObject {
  [K: string]: Task[];
}
const ROADMAP_LIST_ID = '-1';

const OverviewHeader = styled.div`
  width: 100%;
  text-align: start;
  .taskmessage {
    font-family: Ibm Plex Mono;
    font-size: 15px;
  }
  .welcomemessage {
    font-size: 24px;
    line-height: 32px;
  }
`;

const ChartWrapper = styled.div`
  min-width: 840px;
  width: 840px;
  margin-right: 16px;
  margin-top: 16px;
`;

const MeterWrapper = styled.div`
  margin-right: 16px;
  margin-top: 16px;
`;

const ChartFlexbox = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const UsernameSpan = styled.span`
  font-weight: 600;
`;

const TaskCountSpan = styled.span`
  font-weight: 600;
  color: #0ec679;
  text-decoration: underline;
`;

const TaskTableWrapper = styled.div`
  .header {
    font-size: 24px;
    line-height: 32px;
    text-align: start;
    font-weight: 600;
    margin-top: 16px;
  }
`;

export const DashboardPage = () => {
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
    if (!currentRoadmap) return [];
    return currentRoadmap.tasks.filter(
      (task) =>
        !task.ratings.find((rating) => rating.createdByUser === userInfo!.id),
    );
  };

  // TODO move duplicate version organizing / charting logic into custom hook
  useEffect(() => {
    if (roadmapsVersions === undefined) {
      dispatch(versionsActions.getVersions());
      return;
    }
    const versionLists: VersionListsObject = {};
    versionLists[ROADMAP_LIST_ID] = [];
    currentRoadmap!.tasks.forEach((t) => {
      // Try to find version with this tasks id
      roadmapsVersions.forEach((v) => {
        if (!versionLists[v.id]) versionLists[v.id] = [];
        if (v.tasks.includes(t.id)) {
          versionLists[v.id].push(t);
        }
      });
    });

    // Sort tasks
    roadmapsVersions.forEach((v) =>
      versionLists[v.id].sort(
        (a, b) => v.tasks.indexOf(a.id) - v.tasks.indexOf(b.id),
      ),
    );

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
      <OverviewHeader>
        <p className="welcomemessage">
          Welcome <UsernameSpan>@{userInfo!.username}</UsernameSpan>
        </p>
        <p className="taskmessage">
          You have <TaskCountSpan>{getUnratedTasks().length}</TaskCountSpan> new
          tasks to rate →
        </p>
        <RoadmapOverview />
      </OverviewHeader>
      <ChartFlexbox>
        <MeterWrapper>
          <TaskHeatmap />
        </MeterWrapper>
        <ChartWrapper>
          <PlannerChart versions={chartVersionLists} hideButtons />
        </ChartWrapper>
        <MeterWrapper>
          <RoadmapCompletionMeter />
        </MeterWrapper>
      </ChartFlexbox>
      <TaskTableWrapper>
        <p className="header">
          <Trans i18nKey="Unrated tasks" />
        </p>
        <TaskTable tasks={getUnratedTasks()} nofilter />
      </TaskTableWrapper>
    </>
  );
};
