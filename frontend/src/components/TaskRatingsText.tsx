import React from 'react';
import classNames from 'classnames';
import { BusinessValueFilled, RequiredWorkFilled } from './RatingIcons';
import { Task, TaskRatingDimension } from '../redux/roadmaps/types';
import { calcTaskAverageRating } from '../utils/TaskUtils';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

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
    <div className={classes(css.taskRatingRow)}>
      {averageBusinessVal && (
        <div className={classes(css.taskRating)}>
          <div>
            <BusinessValueFilled />
          </div>
          {averageBusinessVal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      )}
      {averageWorkVal && (
        <div className={classes(css.taskRating)}>
          <div>
            <RequiredWorkFilled />
          </div>
          {averageWorkVal.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      )}
      {!averageWorkVal && !averageBusinessVal && <span>-</span>}
    </div>
  );
};
