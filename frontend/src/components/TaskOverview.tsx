import { FC } from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { MetricsSummary } from './MetricsSummary';
import { valueAndWorkSummary } from '../utils/TaskUtils';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task } from '../redux/roadmaps/types';
import colors from '../colors.module.scss';
import css from './TaskOverview.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const TaskOverview: FC<{
  task: Task;
}> = ({ task }) => {
  const { t } = useTranslation();
  const { value, work } = valueAndWorkSummary(task);

  const metrics = [
    {
      label: 'Avg Value',
      metricsValue: numFormat.format(value.avg),
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: 'Avg Work',
      metricsValue: numFormat.format(work.avg),
      children: <WorkRoundIcon color={colors.black100} />,
    },
  ];

  const taskData = [
    [
      { label: 'Title', value: task.name, format: 'bold' },
      { label: 'Description', value: task.description },
    ],
    [
      {
        label: 'Created on',
        value: new Date(task.createdAt).toLocaleDateString(),
        format: 'bold',
      },
      {
        label: 'Status',
        value: task.completed ? 'Completed' : 'Unordered',
        format: task.completed ? 'completed' : 'unordered',
      },
    ],
  ];

  return (
    <div className={classes(css.overview)}>
      <div className={classes(css.metrics)}>
        {metrics.map(({ label, metricsValue, children }) => (
          <MetricsSummary key={label} label={t(label)} value={metricsValue}>
            {children}
          </MetricsSummary>
        ))}
      </div>
      <div className={classes(css.data)}>
        {taskData.map((column, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={classes(css.dataColumn)} key={idx}>
            {column.map((row) => (
              <div className={classes(css.dataRow)} key={row.label}>
                <div className={classes(css.label)}>
                  <Trans i18nKey={row.label} />
                </div>
                <div className={classes(css.value, css[row.format ?? ''])}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
