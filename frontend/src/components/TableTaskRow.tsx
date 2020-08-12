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
import { UserInfo, UserType } from '../redux/user/types';
import { StyledTd, StyledTr } from './CommonLayoutComponents';
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

  const deleteTaskClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(roadmapsActions.deleteTask({ id, roadmapId }));
  };

  const editTaskClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_TASK_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const rateTaskClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_TASK_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const taskRatingDetailsClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_RATINGS_INFO_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const taskDetailsClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_INFO_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const toggleCompletedClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(roadmapsActions.patchTask({ id, completed: !completed }));
  };

  return (
    <StyledTr clickable onClick={taskDetailsClicked}>
      <StyledTd clickable textAlign="center" onClick={toggleCompletedClicked}>
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
      <StyledTd textAlign="end" nowrap width="202px">
        {!task.ratings.find(
          (rating) => rating.createdByUser === userInfo?.id,
        ) && (
          <a
            href={`?openModal=${
              ModalTypes.TASK_RATINGS_INFO_MODAL
            }&modalProps=${encodeURIComponent(
              JSON.stringify({ taskId: task.id }),
            )}`}
          >
            <StyledButton buttonType="ratenow" onClick={rateTaskClicked}>
              <Trans i18nKey="Rate" />
            </StyledButton>
          </a>
        )}
        <ButtonWrapper>
          <RatingsButton
            onClick={taskRatingDetailsClicked}
            href={`?openModal=${
              ModalTypes.TASK_RATINGS_INFO_MODAL
            }&modalProps=${encodeURIComponent(
              JSON.stringify({ taskId: task.id }),
            )}`}
          />
          <InfoButton
            onClick={taskDetailsClicked}
            href={`?openModal=${
              ModalTypes.TASK_INFO_MODAL
            }&modalProps=${encodeURIComponent(
              JSON.stringify({ taskId: task.id }),
            )}`}
          />
          {userInfo!.type === UserType.AdminUser && (
            <>
              <EditButton
                type="large"
                onClick={editTaskClicked}
                href={`?openModal=${
                  ModalTypes.EDIT_TASK_MODAL
                }&modalProps=${encodeURIComponent(
                  JSON.stringify({ taskId: task.id }),
                )}`}
              />
              <DeleteButton onClick={deleteTaskClicked} />
            </>
          )}
        </ButtonWrapper>
      </StyledTd>
    </StyledTr>
  );
};
