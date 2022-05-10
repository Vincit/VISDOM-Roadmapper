import { FC } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { Task } from '../redux/roadmaps/types';
import { BarSection } from './PercentageBar';
import { TaskStatus } from '../../../shared/types/customTypes';
import { taskStatusToText } from '../utils/TaskUtils';
import { percent } from '../utils/string';
import colors from '../colors.module.scss';
import css from './MilestoneCompletedness.module.scss';

const classes = classNames.bind(css);

const colorByStatus = (status: number) => {
  if (status === TaskStatus.COMPLETED) return colors.emerald;
  if (status === TaskStatus.IN_PROGRESS) return colors.orange;
  return colors.black10;
};

export const MilestoneCompletedness: FC<{
  tasks: Task[];
}> = ({ tasks }) => {
  const total = tasks.length;
  const nums = tasks.reduce(
    (acc, { status }) => ({ ...acc, [status]: acc[status] + 1 }),
    {
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.NOT_STARTED]: 0,
    },
  );
  const orderedNums = Object.entries(nums).sort(
    ([a], [b]) => Number(b) - Number(a),
  );

  return (
    <Tooltip
      classes={{
        arrow: classes(css.tooltipArrow),
        tooltip: classes(css.tooltip),
      }}
      title={
        <div className={classes(css.completednessTooltip)}>
          {orderedNums.map(([status, num]) => (
            <div key={status}>
              <span>
                <Trans i18nKey={taskStatusToText(Number(status))} />
              </span>
              {percent(1).format(num / total)}
            </div>
          ))}
        </div>
      }
      placement="right"
      arrow
    >
      <div className={classes(css.completedness)}>
        {percent(0).format(nums[TaskStatus.COMPLETED] / total)}{' '}
        <Trans i18nKey="Completed" />
        <div className={classes(css.progressIndicator)}>
          {orderedNums.map(([status, num]) => {
            if (!num) return null;
            return (
              <BarSection
                key={status}
                size={num / total}
                color={colorByStatus(Number(status))}
                barThicknessPx={10}
              />
            );
          })}
        </div>
      </div>
    </Tooltip>
  );
};
