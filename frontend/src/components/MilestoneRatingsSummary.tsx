import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Task } from '../redux/roadmaps/types';
import css from './MilestoneRatingsSummary.module.scss';
import { milestoneRatingSummary } from '../utils/TaskUtils';

const classes = classNames.bind(css);

const Rating: FC<{
  title: string;
  value: number;
}> = ({ title, value }) => {
  return (
    <div className={classes(css.ratingDiv)}>
      {title}
      <div className={classes(css.rating)}>
        {value ? (
          value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        ) : (
          <span>-</span>
        )}
      </div>
    </div>
  );
};

export const MilestoneRatingsSummary: FC<{
  tasks: Task[];
  completed?: boolean;
}> = ({ tasks, completed }) => {
  const { t } = useTranslation();
  const summary = milestoneRatingSummary(tasks);
  const complexity = summary.complexity();
  const value = summary.value('avg');
  return (
    <div className={classes(css.ratingSummary, { [css.completed]: completed })}>
      <Rating title={t('Average value')} value={value.avg} />
      <Rating title={t('Average complexity')} value={complexity.avg} />
      <Rating title={t('Total value')} value={value.total} />
      <Rating title={t('Total complexity')} value={complexity.total} />
    </div>
  );
};
