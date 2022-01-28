import { FC } from 'react';
import classNames from 'classnames';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task } from '../redux/roadmaps/types';
import { averageValueAndComplexity } from '../utils/TaskUtils';
import colors from '../colors.module.scss';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: FC<{
  task: Task;
  selected?: boolean;
  largeIcons?: true;
  dragging?: boolean;
}> = ({ task, selected, largeIcons, dragging }) => {
  const { complexity, value } = averageValueAndComplexity([task]);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const color = selected ? colors.white : colors.azure;
  return (
    <div
      className={classes(css.taskRatingRow, {
        [css.dragging]: dragging,
      })}
    >
      <div className={classes(css.taskRating)}>
        <BusinessIcon size={largeIcons ? 'small' : 'xxsmall'} color={color} />
        {numFormat.format(value)}
      </div>
      <div className={classes(css.taskRating)}>
        <WorkRoundIcon size={largeIcons ? 'small' : 'xxsmall'} color={color} />
        {numFormat.format(complexity)}
      </div>
    </div>
  );
};
