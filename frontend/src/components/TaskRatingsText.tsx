import { FC } from 'react';
import classNames from 'classnames';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task } from '../redux/roadmaps/types';
import { ratingSummary } from '../utils/TaskUtils';
import colors from '../colors.module.scss';

import css from './TaskRatingsText.module.scss';

const classes = classNames.bind(css);

export const TaskRatingsText: FC<{
  task: Task;
  selected?: boolean;
  largeIcons?: true;
}> = ({ task, selected, largeIcons }) => {
  const { complexity, value } = ratingSummary(task);
  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const color = selected ? colors.white : colors.azure;
  return (
    <div className={classes(css.taskRatingRow)}>
      <div className={classes(css.taskRating)}>
        <BusinessIcon size={largeIcons ? 'small' : 'xxsmall'} color={color} />
        {numFormat.format(value().avg)}
      </div>
      <div className={classes(css.taskRating)}>
        <WorkRoundIcon size={largeIcons ? 'small' : 'xxsmall'} color={color} />
        {numFormat.format(complexity())}
      </div>
    </div>
  );
};
