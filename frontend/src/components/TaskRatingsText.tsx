import { FC } from 'react';
import classNames from 'classnames';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task } from '../redux/roadmaps/types';
import { averageValueAndWork } from '../utils/TaskUtils';
import colors from '../colors.module.scss';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: FC<{
  task: Task;
  selected?: boolean;
  completed?: boolean;
  largeIcons?: true;
}> = ({ task, selected, completed, largeIcons }) => {
  const { work, value } = averageValueAndWork([task]);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  let color = completed ? colors.forest : colors.azure;
  if (selected) color = colors.white;
  return (
    <div className={classes(css.taskRatingRow)}>
      <div className={classes(css.taskRating)}>
        <BusinessIcon size={largeIcons ? 'small' : 'xxsmall'} color={color} />
        {numFormat.format(value)}
      </div>
      <div className={classes(css.taskRating)}>
        <WorkRoundIcon size={largeIcons ? 'small' : 'xxsmall'} color={color} />
        {numFormat.format(work)}
      </div>
    </div>
  );
};
