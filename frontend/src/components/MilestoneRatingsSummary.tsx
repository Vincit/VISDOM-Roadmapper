import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Task } from '../redux/roadmaps/types';
import css from './MilestoneRatingsSummary.module.scss';
import {
  totalValueAndComplexity,
  averageValueAndComplexity,
} from '../utils/TaskUtils';

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
}> = ({ tasks }) => {
  const { t } = useTranslation();
  const totalRatings = totalValueAndComplexity(tasks);
  const averageRatings = averageValueAndComplexity(tasks);
  return (
    <div className={classes(css.ratingSummary)}>
      <Rating title={t('Average value')} value={averageRatings.value} />
      <Rating
        title={t('Average complexity')}
        value={averageRatings.complexity}
      />
      <Rating title={t('Total value')} value={totalRatings.value} />
      <Rating title={t('Total complexity')} value={totalRatings.complexity} />
    </div>
  );
};
