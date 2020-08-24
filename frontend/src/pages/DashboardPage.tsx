import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { PlannerChart } from '../components/PlannerChart';
import { RoadmapOverview } from '../components/RoadmapOverview';
import { TaskHeatmap } from '../components/TaskHeatmap';
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
`;

const ChartWrapper = styled.div`
  width: 840px;
  margin-left: 16px;
`;

const ChartFlexbox = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 16px;
`;

const UsernameSpan = styled.span`
  font-weight: 600;
`;

const TaskCountSpan = styled.span`
  font-weight: 600;
  color: #0ec679;
  text-decoration: underline;
`;

const WelcomeMessageWrapper = styled.p`
  font-size: 24px;
  line-height: 32px;
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

  const getUnratedTasksCount = () => {
    if (!currentRoadmap) return 0;
    return currentRoadmap.tasks.filter(
      (task) =>
        !task.ratings.find((rating) => rating.createdByUser === userInfo!.id),
    ).length;
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
    <OverviewHeader>
      <WelcomeMessageWrapper>
        Welcome <UsernameSpan>@{userInfo!.username}</UsernameSpan>
      </WelcomeMessageWrapper>
      <p className="taskmessage">
        You have <TaskCountSpan>{getUnratedTasksCount()}</TaskCountSpan> new
        tasks to rate →
      </p>
      <RoadmapOverview />
      <ChartFlexbox>
        <TaskHeatmap />
        <ChartWrapper>
          <PlannerChart versions={chartVersionLists} hideButtons />
        </ChartWrapper>
      </ChartFlexbox>
    </OverviewHeader>
  );
};
