import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { StarFill, Wrench, List } from 'react-bootstrap-icons';
import classNames from 'classnames';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  roadmapsVersionsSelector,
  plannerTimeEstimatesSelector,
} from '../redux/versions/selectors';
import { Version, TimeEstimate } from '../redux/versions/types';
import { calcTaskAverageRating, totalValueAndWork } from '../utils/TaskUtils';
import { StoreDispatchType } from '../redux';
import { versionsActions } from '../redux/versions';
import css from './TimeEstimationPage.module.scss';

const classes = classNames.bind(css);

export const TimeEstimationPage = () => {
  const { t } = useTranslation();
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const timeEstimates = useSelector<RootState, TimeEstimate[]>(
    plannerTimeEstimatesSelector,
    shallowEqual,
  );

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    undefined | number
  >(undefined);
  const [calculatedDaysPerWork, setCalculatedDaysPerWork] = useState<
    undefined | number
  >(undefined);

  useEffect(() => {
    if (!roadmapsVersions) dispatch(versionsActions.getVersions());
  }, [dispatch, roadmapsVersions]);

  const handleMilestoneChange = (e: any) => {
    if (e.currentTarget.value !== '') {
      const selectedId = parseInt(e.currentTarget.value, 10);
      setSelectedMilestoneId(selectedId);
    } else {
      setSelectedMilestoneId(undefined);
    }
  };

  const onDurationChange = (duration: string) => {
    const milestone = selectedMilestoneId;
    const time = parseFloat(duration);
    if (milestone !== undefined && roadmap) {
      dispatch(
        versionsActions.setTimeEstimate({
          roadmapId: roadmap!.id,
          id: milestone,
          estimate: time > 0 ? time : undefined,
        }),
      );
    }
  };

  const milestoneDuration =
    roadmap && selectedMilestoneId !== undefined
      ? timeEstimates.find(
          ({ roadmapId, id }) =>
            roadmapId === roadmap!.id && id === selectedMilestoneId,
        )?.estimate
      : undefined;

  useEffect(() => {
    if (!roadmapsVersions || !roadmap) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    const selectedMilestone = roadmapsVersions!.find(
      (ver) => ver.id === selectedMilestoneId,
    );
    if (!selectedMilestone) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    if (milestoneDuration === undefined) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    const work = selectedMilestone.tasks
      .map((taskId) => roadmap?.tasks.find((task) => task.id === taskId))
      .reduce(
        (total, task) =>
          total +
          (calcTaskAverageRating(TaskRatingDimension.RequiredWork, task!) || 0),
        0,
      );

    if (work <= 0) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    setCalculatedDaysPerWork(milestoneDuration / work);
  }, [selectedMilestoneId, milestoneDuration, roadmap, roadmapsVersions]);

  const renderMilestoneTimeline = () => {
    return (
      <>
        <p className={classes(css.graphTitle)}>
          <Trans i18nKey="Predicted milestone durations" />
        </p>
        <div className={classes(css.graphInner)}>
          <div className={classes(css.graphItems)}>
            {roadmapsVersions?.map((ver) => {
              const numTasks = ver.tasks.length;
              const versionTasks = ver.tasks.map(
                (taskId) => roadmap!.tasks.find((task) => task.id === taskId)!,
              );
              const { value, work } = totalValueAndWork(versionTasks);
              const duration = work * calculatedDaysPerWork!;
              return (
                <div className={classes(css.graphItemWrapper)} key={ver.id}>
                  <div
                    className={classes(css.graphItem)}
                    style={{ width: '200px', height: '225px' }}
                  >
                    <p className={classes(css.versionData, css.versionTitle)}>
                      {ver.name}
                    </p>
                    <p className={classes(css.versionData)}>
                      <StarFill />
                      {value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })}
                    </p>
                    <p className={classes(css.versionData)}>
                      <Wrench />
                      {work.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })}
                    </p>
                    <p className={classes(css.versionData)}>
                      <List />
                      {numTasks}
                    </p>
                  </div>
                  <div className={classes(css.graphItemDuration)}>
                    {duration.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}{' '}
                    days
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <p className={classes(css.graphTitle)}>
        <Trans i18nKey="Estimate milestone durations" />
      </p>
      <div className={classes(css.inputContainer)}>
        <div>
          <label className={classes(css.formLabel)} htmlFor="milestones">
            <Trans i18nKey="Milestone to be compared to" />
            <select
              className={classes(css.versionSelect)}
              name="milestones"
              id="milestones"
              onChange={handleMilestoneChange}
              placeholder={t('Select milestone')}
              defaultValue=""
            >
              <option disabled value="">
                Select a milestone
              </option>
              {roadmapsVersions?.map((ver) => {
                return (
                  <option key={ver.id} value={ver.id}>
                    {ver.name}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div className={classes(css.textInputWrapper)}>
          <label className={classes(css.formLabel)} htmlFor="duration">
            <Trans i18nKey="Working days estimation" />
            <input
              className="number"
              required
              name="duration"
              id="duration"
              type="number"
              placeholder={t('Duration')}
              value={milestoneDuration}
              onChange={(e: any) => onDurationChange(e.currentTarget.value)}
              onKeyPress={(e: any) => {
                // Prevents input of non-numeric characters
                if (e.which < 48 || e.which > 57) {
                  e.preventDefault();
                }
              }}
            />
          </label>
        </div>
      </div>
      {calculatedDaysPerWork === undefined &&
        selectedMilestoneId !== undefined &&
        milestoneDuration && (
          <Alert show variant="danger">
            <Trans i18nKey="Unable to calculate work" />
          </Alert>
        )}
      {calculatedDaysPerWork !== undefined && renderMilestoneTimeline()}
    </>
  );
};
