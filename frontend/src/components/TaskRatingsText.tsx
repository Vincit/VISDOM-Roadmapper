import React from 'react';
import classNames from 'classnames';
import { BusinessValueFilled, RequiredWorkFilled } from './RatingIcons';
import { Task } from '../redux/roadmaps/types';
import { averageValueAndWork } from '../utils/TaskUtils';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: React.FC<{ task: Task }> = ({ task }) => {
  const { work, value } = averageValueAndWork([task]);
  return (
    <div className={classes(css.taskRatingRow)}>
      {value && (
        <div className={classes(css.taskRating)}>
          <div>
            <BusinessValueFilled />
          </div>
          {value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      )}
      {work && (
        <div className={classes(css.taskRating)}>
          <div>
            <RequiredWorkFilled />
          </div>
          {work.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      )}
      {!work && !value && <span>-</span>}
    </div>
  );
};
