import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import styled from 'styled-components';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { StarFill, Wrench, List } from 'react-bootstrap-icons';
import { calcTaskAverageRating } from '../utils/TaskUtils';
import { Trans, useTranslation } from 'react-i18next';
import { StyledFormControl } from '../components/forms/StyledFormControl';
import { Alert } from 'react-bootstrap';

const GraphTitle = styled.p`
  font-size: 28px;
  font-weight: 600;
  text-align: start;
`;

const FormLabel = styled.label`
  text-align: start;
  font-size: 14px;
  font-family: IBM Plex Mono;
`;

const GraphInner = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow-x: auto;
  justify-content: flex-start;
`;

const GraphItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  overflow-x: visible;
`;

const GraphItem = styled.div<{
  width: string;
  height: string;
}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border: 1px solid red;
  overflow-x: visible;
  border-radius: 8px;
  padding: 8px;
  background-color: #fbfbfb;
  border: 1px solid #f1f1f1;
  -webkit-box-shadow: 4px 4px 7px -2px rgba(0, 0, 0, 0.35);
  -moz-box-shadow: 4px 4px 7px -2px rgba(0, 0, 0, 0.35);
  box-shadow: 4px 4px 7px -2px rgba(0, 0, 0, 0.35);
`;

const GraphItemWrapper = styled.div`
  text-align: center;
  margin-right: 22px;
`;

const GraphItemDuration = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: bold;
`;

const VersionSelect = styled.select`
  display: block;
  min-width: 250px;
  max-width: 250px;
  font-size: 16px;
  margin-top: 6px;
`;

const TextInputWrapper = styled.div`
  width: 240px;
  margin-left: 16px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 32px;
`;

const VersionData = styled.p`
  font-family: IBM Plex Mono;
  padding: 0;
  margin: 0;
  font-size: 12px;
  text-align: start;
  svg {
    position: relative;
    top: -1px;
    color: #4fbeff;
    margin-right: 2px;
    width: 13px;
    height: 13px;
  }
`;

const VersionTitle = styled(VersionData)`
  font-weight: bold;
  font-size: 14px;
  font-family: unset;
`;

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
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<
    undefined | number
  >(undefined);
  const [calculatedDaysPerWork, setCalculatedDaysPerWork] = useState<
    undefined | number
  >(undefined);

  const [milestoneDuration, setMilestoneDuration] = useState<string>('');
  const handleMilestoneChange = (e: any) => {
    if (e.currentTarget.value !== '') {
      const selectedId = parseInt(e.currentTarget.value, 10);
      setSelectedMilestoneId(selectedId);
    } else {
      setSelectedMilestoneId(undefined);
    }
  };

  const onDurationChange = (duration: string) => {
    setMilestoneDuration(duration);
  };

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
    if (
      Number.isNaN(parseFloat(milestoneDuration)) ||
      parseFloat(milestoneDuration) <= 0
    ) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    let work = 0;
    let milestoneTasks = selectedMilestone.tasks.map((taskId) =>
      roadmap?.tasks.find((task) => task.id === taskId),
    );
    milestoneTasks.forEach((task) => {
      work +=
        calcTaskAverageRating(TaskRatingDimension.RequiredWork, task!) || 0;
    });

    console.log(work);
    if (work <= 0) {
      setCalculatedDaysPerWork(undefined);
      return;
    }
    setCalculatedDaysPerWork(parseFloat(milestoneDuration) / work);
  }, [selectedMilestoneId, milestoneDuration, roadmap, roadmapsVersions]);

  const renderMilestoneTimeline = () => {
    return (
      <>
        <GraphTitle>
          <Trans i18nKey="Predicted milestone durations" />
        </GraphTitle>
        <GraphInner>
          <GraphItems>
            {roadmapsVersions?.map((ver) => {
              let value = 0;
              let work = 0;
              let numTasks = 0;
              let versionTasks = ver.tasks.map((taskId) =>
                roadmap?.tasks.find((task) => task.id === taskId),
              );
              versionTasks.forEach((task) => {
                numTasks += 1;
                value +=
                  calcTaskAverageRating(
                    TaskRatingDimension.BusinessValue,
                    task!,
                  ) || 0;

                work +=
                  calcTaskAverageRating(
                    TaskRatingDimension.RequiredWork,
                    task!,
                  ) || 0;
              });
              const duration = work * calculatedDaysPerWork!;
              return (
                <GraphItemWrapper key={ver.id}>
                  <GraphItem width={`200px`} height={`225px`}>
                    <VersionTitle>{ver.name}</VersionTitle>
                    <VersionData>
                      <StarFill />
                      {value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })}
                    </VersionData>
                    <VersionData>
                      <Wrench />
                      {work.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })}
                    </VersionData>
                    <VersionData>
                      <List />
                      {numTasks}
                    </VersionData>
                  </GraphItem>
                  <GraphItemDuration>
                    {duration.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}{' '}
                    days
                  </GraphItemDuration>
                </GraphItemWrapper>
              );
            })}
          </GraphItems>
        </GraphInner>
      </>
    );
  };

  return (
    <>
      <GraphTitle>
        <Trans i18nKey="Estimate milestone durations" />
      </GraphTitle>
      <InputContainer>
        <div>
          <FormLabel htmlFor="milestones">
            <Trans i18nKey="Milestone to compare with" />
          </FormLabel>
          <VersionSelect
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
          </VersionSelect>
        </div>

        <TextInputWrapper>
          <FormLabel htmlFor="duration">
            <Trans i18nKey="Working days estimation" />
          </FormLabel>
          <StyledFormControl
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
        </TextInputWrapper>
      </InputContainer>
      {calculatedDaysPerWork === undefined &&
        selectedMilestoneId !== undefined &&
        milestoneDuration && (
          <Alert show={true} variant="danger">
            <Trans i18nKey="Unable to calculate work" />
          </Alert>
        )}
      {calculatedDaysPerWork !== undefined && renderMilestoneTimeline()}
    </>
  );
};
