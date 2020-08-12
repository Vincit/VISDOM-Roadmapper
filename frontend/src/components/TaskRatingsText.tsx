import React from 'react';
import { StarFill, Wrench } from 'react-bootstrap-icons';
import { shallowEqual, useSelector } from 'react-redux';
import { publicUsersSelector } from '../redux/roadmaps/selectors';
import { PublicUser, Task, TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  calcTaskAverageRating,
  calcWeightedTaskPriority,
} from '../utils/TaskUtils';

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
  return (
    <>
      {averageBusinessVal && (
        <span className="mr-1 font-weight-bold">
          {averageBusinessVal}
          <StarFill />
        </span>
      )}
      {averageWorkVal && (
        <span className="mr-1 font-weight-bold">
          {averageWorkVal}
          <Wrench />
        </span>
      )}
      {averageWorkVal && averageBusinessVal && (
        <span className="mr-1 font-weight-bold">
          {calcWeightedTaskPriority(task, publicUsers!)}
        </span>
      )}
      {!averageWorkVal && !averageBusinessVal && <span>-</span>}
    </>
  );
};
