import React from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Task } from '../redux/roadmaps/types';
import css from './MilestoneRatingsSummary.module.scss';
import { totalValueAndWork, averageValueAndWork } from '../utils/TaskUtils';

const classes = classNames.bind(css);

export const MilestoneRatingsSummary: React.FC<{
  tasks: Task[];
}> = ({ tasks }) => {
  const totalRatings = totalValueAndWork(tasks);
  const averageRatings = averageValueAndWork(tasks);
  return (
    <div className={classes(css.ratingSummary)}>
      <div className={classes(css.ratingDiv)}>
        <Trans i18nKey="Average value" />
        <div className={classes(css.rating)}>
          {averageRatings.value ? (
            averageRatings.value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
      <div className={classes(css.ratingDiv)}>
        <Trans i18nKey="Average work" />
        <div className={classes(css.rating)}>
          {averageRatings.work ? (
            averageRatings.work.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
      <div className={classes(css.ratingDiv)}>
        <Trans i18nKey="Total value" />
        <div className={classes(css.rating)}>
          {totalRatings.value ? (
            totalRatings.value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
      <div className={classes(css.ratingDiv)}>
        <Trans i18nKey="Total work" />
        <div className={classes(css.rating)}>
          {totalRatings.value ? (
            totalRatings.value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
    </div>
  );
};
