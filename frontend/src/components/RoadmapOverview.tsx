import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import styled from 'styled-components';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { BusinessValueFilled, RequiredWorkFilled } from './RatingIcons';

const DataFlexbox = styled.div`
  margin-top: 32px;
  display: flex;
`;

const DataNumberWrapper = styled.p`
  font-family: Work Sans;
  margin: auto;
  color: #00a3ff;
  font-size: 36px;
  font-weight: 300;
  margin-top: 0;

  svg {
    position: relative;
    top: -4px;
    color: #00a3ff;
    width: 32px;
    height: 32px;
  }
`;
const DataEntryWrapper = styled.div`
  font-family: Ibm Plex Mono;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.2em;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  margin-left: 0px;
  margin-right: 16px;
  border-radius: 24px;
  background-color: #f6f6f6;
  text-transform: uppercase;
`;

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

  const roadmapAverageRating = (dimension: TaskRatingDimension) => {
    let sum = 0;
    let count = 0;
    roadmap!.tasks.forEach((task) => {
      task.ratings.forEach((rating) => {
        if (rating.dimension === dimension) {
          sum += rating.value;
          count += 1;
        }
      });
    });

    return count > 0 ? sum / count : 0;
  };

  return (
    <DataFlexbox>
      <DataEntryWrapper>
        <Trans i18nKey="Tasks" />
        <DataNumberWrapper>{roadmapTasksCount()}</DataNumberWrapper>
      </DataEntryWrapper>
      <DataEntryWrapper>
        <Trans i18nKey="milestones" />
        <DataNumberWrapper>{roadmapMilestonesCount()}</DataNumberWrapper>
      </DataEntryWrapper>
      <DataEntryWrapper>
        <Trans i18nKey="Avg. Rating" />
        <DataNumberWrapper>
          <BusinessValueFilled />
          {roadmapAverageRating(TaskRatingDimension.BusinessValue)}
        </DataNumberWrapper>
      </DataEntryWrapper>
      <DataEntryWrapper>
        <Trans i18nKey="Avg. Rating" />
        <DataNumberWrapper>
          <RequiredWorkFilled />
          {roadmapAverageRating(TaskRatingDimension.RequiredWork)}
        </DataNumberWrapper>
      </DataEntryWrapper>
    </DataFlexbox>
  );
};
