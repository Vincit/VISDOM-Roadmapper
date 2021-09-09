import { FC } from 'react';
import classNames from 'classnames';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task } from '../redux/roadmaps/types';
import { averageValueAndWork } from '../utils/TaskUtils';
import colors from '../colors.module.scss';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: FC<{ task: Task }> = ({ task }) => {
  const { work, value } = averageValueAndWork([task]);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return (
    <div className={classes(css.taskRatingRow)}>
      {value && (
        <div className={classes(css.taskRating)}>
          <BusinessIcon size="xxsmall" color={colors.azure} />
          {numFormat.format(value)}
        </div>
      )}
      {work && (
        <div className={classes(css.taskRating)}>
          <WorkRoundIcon size="xxsmall" color={colors.azure} />
          {numFormat.format(work)}
        </div>
      )}
      {!work && !value && <span>-</span>}
    </div>
  );
};
