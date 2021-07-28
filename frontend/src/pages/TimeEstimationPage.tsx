import { useEffect, useState, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { roadmapsActions } from '../redux/roadmaps';
import {
  chosenRoadmapSelector,
  roadmapsVersionsSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap, Version } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { plannerTimeEstimatesSelector } from '../redux/versions/selectors';
import { TimeEstimate } from '../redux/versions/types';
import { totalValueAndWork } from '../utils/TaskUtils';
import { StoreDispatchType } from '../redux';
import { versionsActions } from '../redux/versions';
import css from './TimeEstimationPage.module.scss';

import { MilestoneRatingsSummary } from '../components/MilestoneRatingsSummary';
import { Dropdown } from '../components/forms/Dropdown';

const classes = classNames.bind(css);

export const TimeEstimationPage = () => {
  const { t } = useTranslation();
  const durationInput = useRef<HTMLInputElement>(null);
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
  const [selectedTitle, setSelectedTitle] = useState<string | undefined>(
    undefined,
  );
  const [calculatedDaysPerWork, setCalculatedDaysPerWork] = useState<
    undefined | number
  >(undefined);

  useEffect(() => {
    if (roadmap && !roadmapsVersions)
      dispatch(roadmapsActions.getVersions(roadmap.id));
  }, [dispatch, roadmap, roadmapsVersions]);

  const handleMilestoneChange = (version: Version) => {
    if (timeEstimates.filter((e) => e.id === version.id).length === 0) {
      if (durationInput.current !== null) durationInput.current.value = '';
    }
    if (version) {
      setSelectedMilestoneId(version.id);
      setSelectedTitle(version.name);
    } else {
      setSelectedMilestoneId(undefined);
      setSelectedTitle(undefined);
    }
  };

  const onDurationChange = (duration: string) => {
    const milestone = selectedMilestoneId;
    const time = parseFloat(duration);
    if (milestone !== undefined && roadmap) {
      dispatch(
        versionsActions.setTimeEstimate({
          roadmapId: roadmap.id,
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
            roadmapId === roadmap.id && id === selectedMilestoneId,
        )?.estimate
      : undefined;

  useEffect(() => {
    if (!roadmapsVersions || !roadmap) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    const selectedMilestone = roadmapsVersions.find(
      (ver) => ver.id === selectedMilestoneId,
    );
    if (!selectedMilestone || milestoneDuration === undefined) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    const { work } = totalValueAndWork(selectedMilestone.tasks);
    if (work <= 0) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    setCalculatedDaysPerWork(milestoneDuration / work);
  }, [selectedMilestoneId, milestoneDuration, roadmap, roadmapsVersions]);

  const renderMilestoneTimeline = () => {
    return (
      <div className={classes(css.timelineContainer)}>
        <p className={classes(css.graphTitle)}>
          <Trans i18nKey="This is how other milestones look" />
          <InfoOutlinedIcon className={classes(css.infoIcon)} />
        </p>
        <div className={classes(css.graphInner)}>
          <div className={classes(css.graphItems)}>
            <table className={classes(css.timelineTable)}>
              <tbody>
                <tr className={classes(css.graphItemRow)}>
                  {roadmapsVersions?.map((ver) => {
                    return (
                      <td
                        key={`graphItem-${ver.id}`}
                        className={classes(css.graphItemWrapper)}
                      >
                        <div
                          className={
                            ver.name === selectedTitle
                              ? classes(css.selectedGraphItem)
                              : classes(css.graphItem)
                          }
                        >
                          <p
                            className={classes(
                              css.versionData,
                              css.versionTitle,
                            )}
                          >
                            {ver.name}
                          </p>
                          <hr className={classes(css.horizontalLine)} />
                          <div
                            className={
                              (ver.name === selectedTitle &&
                                classes(css.test)) ||
                              undefined
                            }
                          >
                            <MilestoneRatingsSummary tasks={ver.tasks || []} />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr className={classes(css.verticalLineRow)}>
                  {roadmapsVersions?.map((ver) => {
                    return (
                      <td key={`verticalLine-${ver.id}`}>
                        <div className={classes(css.verticalLine)} />
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  {roadmapsVersions?.map((ver) => {
                    const { work } = totalValueAndWork(ver.tasks);
                    const duration = work * calculatedDaysPerWork!;
                    return (
                      <td
                        key={`graphItemDuration-${ver.id}`}
                        className={
                          ver.name === selectedTitle
                            ? classes(css.selectedGraphItemDuration)
                            : classes(css.graphItemDuration)
                        }
                      >
                        {duration.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 1,
                        })}{' '}
                        days
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={classes(css.plannerPagecontainer, css.timeEstimation)}>
      <p className={classes(css.graphTitle)}>
        <Trans i18nKey="Estimate milestone durations" />
      </p>
      <div className={classes(css.inputContainer)}>
        <div>
          <div className={classes(css.formLabel)}>
            <Trans i18nKey="Milestone to be compared to" />
          </div>
          {!roadmapsVersions ||
            (roadmapsVersions.length === 0 ? (
              <Dropdown css={css} title="No milestones available" empty />
            ) : (
              <Dropdown title={selectedTitle} css={css} maxLength={40}>
                {roadmapsVersions
                  .filter((e) => e.name !== selectedTitle)
                  .map((ver) => {
                    return (
                      <option
                        className={classes(css.dropItem)}
                        key={ver.id}
                        value={ver.id}
                        onClick={() => handleMilestoneChange(ver)}
                      >
                        {ver.name}
                      </option>
                    );
                  })}
              </Dropdown>
            ))}
        </div>

        {selectedMilestoneId && (
          <div className={classes(css.textInputWrapper)}>
            <label className={classes(css.formLabel)} htmlFor="duration">
              <Trans i18nKey="Working days estimation" />
              <input
                className={classes(css.durationInput)}
                required
                ref={durationInput}
                name="duration"
                id="duration"
                type="number"
                placeholder={t('Duration')}
                value={milestoneDuration || ''}
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
        )}
      </div>
      {calculatedDaysPerWork === undefined &&
        selectedMilestoneId !== undefined &&
        milestoneDuration && (
          <Alert show variant="danger">
            <Trans i18nKey="Unable to calculate work" />
          </Alert>
        )}
      {calculatedDaysPerWork !== undefined && renderMilestoneTimeline()}
    </div>
  );
};
