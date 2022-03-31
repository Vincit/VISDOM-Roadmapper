import { useEffect, useState, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Version } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { plannerTimeEstimatesSelector } from '../redux/versions/selectors';
import { TimeEstimate } from '../redux/versions/types';
import { totalValueAndComplexity } from '../utils/TaskUtils';
import { StoreDispatchType } from '../redux';
import { versionsActions } from '../redux/versions';
import css from './TimeEstimationPage.module.scss';

import { MilestoneRatingsSummary } from '../components/MilestoneRatingsSummary';
import { Dropdown } from '../components/forms/Dropdown';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { apiV2 } from '../api/api';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { getType } from '../utils/UserUtils';
import { UserInfo } from '../redux/user/types';
import { userInfoSelector } from '../redux/user/selectors';

const classes = classNames.bind(css);

export const TimeEstimationPage = () => {
  const { t } = useTranslation();
  const durationInput = useRef<HTMLInputElement>(null);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const type = getType(userInfo, roadmapId);
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
    {
      skip: !hasPermission(type, Permission.VersionRead),
    },
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
    if (milestone !== undefined && roadmapId) {
      dispatch(
        versionsActions.setTimeEstimate({
          roadmapId,
          id: milestone,
          estimate: time > 0 ? time : undefined,
        }),
      );
    }
  };

  const milestoneDuration =
    roadmapId && selectedMilestoneId !== undefined
      ? timeEstimates.find(
          ({ roadmapId: roadmap, id }) =>
            roadmapId === roadmap && id === selectedMilestoneId,
        )?.estimate
      : undefined;

  useEffect(() => {
    if (!roadmapsVersions || !roadmapId) {
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
    const { complexity } = totalValueAndComplexity(selectedMilestone.tasks);
    if (complexity <= 0) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    setCalculatedDaysPerWork(milestoneDuration / complexity);
  }, [selectedMilestoneId, milestoneDuration, roadmapId, roadmapsVersions]);

  const handleTooltipModal = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.INFO_MODAL,
        modalProps: {
          header: t('Estimate milestone durations'),
          content: {
            subHeader: t(
              'Compare milestone durations with different estimates',
            ),
            columns: [
              {
                header: t('Realization'),
                text: t('system calculated average values over time'),
              },
              {
                header: t('Comparison'),
                text: t('compare to another milestone'),
              },
              {
                header: t('Custom'),
                text: t(
                  'estimate with a custom value for work amount in working days',
                ),
              },
            ],
          },
        },
      }),
    );
  };

  const renderMilestoneTimeline = () => {
    return (
      <div className={classes(css.timelineContainer)}>
        <p className={classes(css.graphTitle)}>
          <Trans i18nKey="This is how other milestones look" />
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
                    const { complexity } = totalValueAndComplexity(ver.tasks);
                    const duration = complexity * calculatedDaysPerWork!;
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
        <InfoIcon
          onClick={handleTooltipModal}
          className={classes(css.tooltipClickable, css.infoIcon)}
        />
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
                  .map((ver) => (
                    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                    <div
                      className={classes(css.dropItem)}
                      key={ver.id}
                      onClick={() => handleMilestoneChange(ver)}
                    >
                      {ver.name}
                    </div>
                  ))}
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
                onChange={(e) => onDurationChange(e.currentTarget.value)}
                onKeyPress={(e) => {
                  if (!/^\d$/.test(e.key)) e.preventDefault();
                }}
              />
            </label>
          </div>
        )}
      </div>
      {calculatedDaysPerWork === undefined &&
        selectedMilestoneId !== undefined &&
        milestoneDuration && (
          <Alert severity="error" icon={false}>
            <Trans i18nKey="Unable to calculate working days estimate" />
          </Alert>
        )}
      {calculatedDaysPerWork !== undefined && renderMilestoneTimeline()}
    </div>
  );
};
