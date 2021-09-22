import { FC } from 'react';
import classNames from 'classnames';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task } from '../redux/roadmaps/types';
import { averageValueAndWork } from '../utils/TaskUtils';
import colors from '../colors.module.scss';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: FC<{ task: Task; selected?: boolean }> = ({
  task,
  selected,
}) => {
  const { work, value } = averageValueAndWork([task]);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return (
    <div className={classes(css.taskRatingRow)}>
      <div className={classes(css.taskRating)}>
        <BusinessIcon color={selected ? '#FFFFFF' : colors.azure} />
        {numFormat.format(value)}
      </div>
      <div className={classes(css.taskRating)}>
        <WorkRoundIcon color={selected ? '#FFFFFF' : colors.azure} />
        {numFormat.format(work)}
      </div>
    </div>
  );
};
