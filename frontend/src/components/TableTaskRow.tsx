import React from 'react';
import { CheckCircle, Circle } from 'react-bootstrap-icons';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { roadmapsActions } from '../redux/roadmaps/index';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { StyledTd } from './CommonLayoutComponents';
import { DeleteButton } from './forms/DeleteButton';
import { EditButton } from './forms/EditButton';
import { InfoButton } from './forms/InfoButton';
import { RatingsButton } from './forms/RatingsButton';
import { StyledButton } from './forms/StyledButton';
import { TaskRatingsText } from './TaskRatingsText';

interface TableTaskRowProps {
  task: Task;
}

const ButtonWrapper = styled.div`
  display: inline-block;
  margin: 4px;
`;

export const TableTaskRow: React.FC<TableTaskRowProps> = ({ task }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { id, name, completed, roadmapId, description, createdAt } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const deleteTask = () => {
    dispatch(roadmapsActions.deleteTask({ id, roadmapId }));
  };

  const editTask = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_TASK_MODAL,
        modalProps: {
          task,
        },
      }),
    );
  };

  const rateTask = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_TASK_MODAL,
        modalProps: {
          task,
        },
      }),
    );
  };

  const taskRatingDetails = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_RATINGS_INFO_MODAL,
        modalProps: {
          task,
        },
      }),
    );
  };

  const taskDetails = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_INFO_MODAL,
        modalProps: {
          task,
        },
      }),
    );
  };

  const toggleTaskCompleted = () => {
    dispatch(roadmapsActions.patchTask({ id, completed: !completed }));
  };

  return (
    <tr>
      <StyledTd
        clickable
        textAlign="center"
        onClick={() => toggleTaskCompleted()}
      >
        {completed ? <CheckCircle /> : <Circle />}
      </StyledTd>
      <StyledTd>{name}</StyledTd>
      <StyledTd>
        {description.length > 75
          ? `${description.slice(0, 75)}...`
          : description}
      </StyledTd>
      <StyledTd nowrap>
        <TaskRatingsText task={task} />
      </StyledTd>
      <StyledTd>{new Date(createdAt).toLocaleDateString()}</StyledTd>
      <StyledTd textAlign="end" nowrap>
        {!task.ratings.find(
          (rating) => rating.createdByUser === userInfo?.id,
        ) && (
          <StyledButton buttonType="ratenow" onClick={() => rateTask()}>
            <Trans i18nKey="Rate" />
          </StyledButton>
        )}
        <ButtonWrapper>
          <RatingsButton onClick={() => taskRatingDetails()} />
          <InfoButton onClick={() => taskDetails()} />
          <EditButton type="large" onClick={() => editTask()} />
          <DeleteButton onClick={() => deleteTask()} />
        </ButtonWrapper>
      </StyledTd>
    </tr>
  );
};
