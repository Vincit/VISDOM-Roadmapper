import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Customer, Task } from '../redux/roadmaps/types';
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

export const MilestoneWeightedRatingsSummary: FC<{
  tasks: Task[];
  customers: Customer[] | undefined;
  completed?: boolean;
}> = ({ tasks, customers, completed }) => {
  const { t } = useTranslation();
  const { value } = milestoneRatingSummary(tasks).weighted(customers);
  return (
    <div className={classes(css.ratingSummary, { [css.completed]: completed })}>
      <Rating title={t('Weighted total value')} value={value('avg').total} />
      <Rating title={t('Weighted average value')} value={value('avg').avg} />
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
  return (
    <div className={classes(css.ratingSummary, { [css.completed]: completed })}>
      <Rating title={t('Average value')} value={summary.value('avg').avg} />
      <Rating title={t('Average complexity')} value={complexity.avg} />
      <Rating title={t('Total value')} value={summary.value('total').total} />
      <Rating title={t('Total complexity')} value={complexity.total} />
    </div>
  );
};
