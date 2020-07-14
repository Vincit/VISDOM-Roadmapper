import React from 'react';
import { StarFill, Wrench } from 'react-bootstrap-icons';
import { Task, TaskRatingDimension } from '../redux/roadmaps/types';
import { calcTaskAverageRating } from '../utils/TaskUtils';

export const TaskRatingsText: React.FC<{ task: Task }> = ({ task }) => {
  const averageBusinessVal = calcTaskAverageRating(
    TaskRatingDimension.BusinessValue,
    task,
  );
  const averageWorkVal = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
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
      {!averageWorkVal && !averageBusinessVal && <span>-</span>}
    </>
  );
};
