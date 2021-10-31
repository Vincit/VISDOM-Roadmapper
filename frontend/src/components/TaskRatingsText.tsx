import { FC } from 'react';
import classNames from 'classnames';
import DoneAllIcon from '@material-ui/icons/DoneAll';
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
  const color = selected ? colors.white : colors.azure;
  return (
    <div className={classes(css.taskRatingRow)}>
      {completed && (
        <DoneAllIcon
          className={classes(css.doneIcon, { [css.white]: selected })}
        />
      )}
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
