import React from 'react';
import { StarFill, Wrench } from 'react-bootstrap-icons';
import { shallowEqual, useSelector } from 'react-redux';
import {
  chosenRoadmapSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import {
  PublicUser,
  Roadmap,
  Task,
  TaskRatingDimension,
} from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  calcTaskAverageRating,
  calcWeightedTaskPriority,
} from '../utils/TaskUtils';
import { Debug } from './Debug';

export const TaskRatingsText: React.FC<{ task: Task }> = ({ task }) => {
  const averageBusinessVal = calcTaskAverageRating(
    TaskRatingDimension.BusinessValue,
    task,
  );
  const averageWorkVal = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
  );
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
  return (
    <>
      {averageBusinessVal && (
        <span className="mr-1 font-weight-bold">
          {averageBusinessVal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
          <StarFill />
        </span>
      )}
      {averageWorkVal && (
        <span className="mr-1 font-weight-bold">
          {averageWorkVal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
          <Wrench />
        </span>
      )}
      {averageWorkVal && averageBusinessVal && (
        <Debug>
          <span className="mr-1 font-weight-bold">
            {calcWeightedTaskPriority(
              task,
              publicUsers!,
              currentRoadmap,
            ).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </span>
        </Debug>
      )}
      {!averageWorkVal && !averageBusinessVal && <span>-</span>}
    </>
  );
};
