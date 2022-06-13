import { FC } from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { Tooltip } from './InfoTooltip';
import { Task } from '../redux/roadmaps/types';
import { BarSection } from './PercentageBar';
import { TaskStatus } from '../../../shared/types/customTypes';
import { taskStatusToText } from '../utils/TaskUtils';
import { percent } from '../utils/string';
import colors from '../colors.module.scss';
import css from './MilestoneCompletedness.module.scss';

const classes = classNames.bind(css);

const colorByStatus = (status: number) => {
  if (status === TaskStatus.COMPLETED) return colors.forest;
  if (status === TaskStatus.IN_PROGRESS) return colors.orange;
  return colors.black10;
};

const TaskStatusLabel: FC<{ status: TaskStatus; percent: number }> = ({
  status,
  percent: percentValue,
}) => {
  const { t } = useTranslation();
  return (
    <div className={classes(css.label, css[TaskStatus[status]])}>
      <div>{t(taskStatusToText(status))}</div>
      <strong>{percent(0).format(percentValue)}</strong>
    </div>
  );
};

export const MilestoneCompletedness: FC<{
  tasks: Task[];
}> = ({ tasks }) => {
  const total = tasks.length || 1;
  const nums = tasks.reduce(
    (acc, { status }) => ({ ...acc, [status]: acc[status] + 1 }),
    {
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.NOT_STARTED]: 0,
    },
  );
  const orderedNums = Object.entries(nums)
    .map(([k, v]) => [Number(k), v])
    .sort(([a], [b]) => b - a);

  return (
    <Tooltip
      title={
        <div className={classes(css.completednessTooltip)}>
          {orderedNums.map(([status, num]) => (
            <div key={status}>
              <span>
                <Trans i18nKey={taskStatusToText(status)} />
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
        <div
          className={classes(css.labels, {
            [css.grey]:
              nums[TaskStatus.COMPLETED] === 0 &&
              nums[TaskStatus.IN_PROGRESS] === 0,
          })}
        >
          <TaskStatusLabel
            status={TaskStatus.COMPLETED}
            percent={nums[TaskStatus.COMPLETED] / total}
          />
          <TaskStatusLabel
            status={TaskStatus.IN_PROGRESS}
            percent={nums[TaskStatus.IN_PROGRESS] / total}
          />
        </div>
        <div className={classes(css.progressIndicator)}>
          {orderedNums.map(([status, num]) => {
            if (!num) return null;
            return (
              <BarSection
                key={status}
                size={num / total}
                color={colorByStatus(status)}
                barThicknessPx={10}
              />
            );
          })}
        </div>
      </div>
    </Tooltip>
  );
};
