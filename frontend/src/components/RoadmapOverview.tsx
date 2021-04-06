import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { BusinessValueFilled, RequiredWorkFilled } from './RatingIcons';
import classNames from 'classnames';
import css from './RoadmapOverview.module.scss';

const classes = classNames.bind(css);

export const RoadmapOverview = () => {
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const roadmapTasksCount = () => {
    return roadmap!.tasks.length;
  };

  const roadmapMilestonesCount = () => {
    return roadmapsVersions?.length || 0;
  };

  const roadmapAverageRating = (dimension: TaskRatingDimension) => {
    let sum = 0;
    let count = 0;
    roadmap!.tasks.forEach((task) => {
      task.ratings.forEach((rating) => {
        if (rating.dimension === dimension) {
          sum += rating.value;
          count += 1;
        }
      });
    });

    return count > 0 ? sum / count : 0;
  };

  return (
    <div className={classes(css.dataFlexbox)}>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="Tasks" />
        <p className={classes(css.dataNumberWrapper)}>{roadmapTasksCount()}</p>
      </div>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="milestones" />
        <p className={classes(css.dataNumberWrapper)}>{roadmapMilestonesCount()}</p>
      </div>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="Avg. Rating" />
        <p className={classes(css.dataNumberWrapper)}>
          <BusinessValueFilled />
          {roadmapAverageRating(
            TaskRatingDimension.BusinessValue,
          ).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className={classes(css.dataEntryWrapper)}>
        <Trans i18nKey="Avg. Rating" />
        <p className={classes(css.dataNumberWrapper)}>
          <RequiredWorkFilled />
          {roadmapAverageRating(
            TaskRatingDimension.RequiredWork,
          ).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
};
