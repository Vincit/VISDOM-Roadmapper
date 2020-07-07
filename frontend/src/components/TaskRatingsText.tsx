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
  const renderBusinessVal = averageBusinessVal >= 0;
  const renderWorkVal = averageWorkVal >= 0;
  return (
    <>
      {renderBusinessVal && (
        <span className="mr-1">
          {averageBusinessVal}
          <StarFill />
        </span>
      )}
      {renderWorkVal && (
        <span>
          {averageWorkVal}
          <Wrench />
        </span>
      )}
      {!renderWorkVal && !renderBusinessVal && <span>-</span>}
    </>
  );
};
