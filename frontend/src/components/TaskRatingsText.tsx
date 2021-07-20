import React from 'react';
import classNames from 'classnames';
import { BusinessValueFilled, RequiredWorkFilled } from './RatingIcons';
import { Task } from '../redux/roadmaps/types';
import { averageValueAndWork } from '../utils/TaskUtils';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: React.FC<{ task: Task }> = ({ task }) => {
  const { work, value } = averageValueAndWork([task]);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return (
    <div className={classes(css.taskRatingRow)}>
      {value && (
        <div className={classes(css.taskRating)}>
          <div>
            <BusinessValueFilled />
          </div>
          {numFormat.format(value)}
        </div>
      )}
      {work && (
        <div className={classes(css.taskRating)}>
          <div>
            <RequiredWorkFilled />
          </div>
          {numFormat.format(work)}
        </div>
      )}
      {!work && !value && <span>-</span>}
    </div>
  );
};
