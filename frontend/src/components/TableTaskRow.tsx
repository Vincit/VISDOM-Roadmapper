import React from 'react';
import { Button } from 'react-bootstrap';
import {
  CheckCircle,
  Circle,
  InfoCircleFill,
  PencilSquare,
  StarFill,
  TrashFill,
} from 'react-bootstrap-icons';
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
import { StyledButton } from './forms/StyledButton';
import { TaskRatingsText } from './TaskRatingsText';

interface TableTaskRowProps {
  task: Task;
}

const TaskTd = styled.td<{
  clickable?: boolean;
  rightalign?: boolean;
  nowrap?: boolean;
}>`
  vertical-align: middle !important;
  max-width: 30em;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'inherit')};
  text-align: ${(props) => (props.rightalign ? 'end' : 'center')};
  white-space: ${(props) => (props.nowrap ? 'nowrap' : 'inherit')};
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
      <TaskTd clickable onClick={() => toggleTaskCompleted()}>
        {completed ? <CheckCircle /> : <Circle />}
      </TaskTd>
      <TaskTd>{name}</TaskTd>
      <TaskTd>
        {description.length > 75
          ? `${description.slice(0, 75)}...`
          : description}
      </TaskTd>
      <TaskTd>
        <TaskRatingsText task={task} />
      </TaskTd>
      <TaskTd>{new Date(createdAt).toLocaleDateString()}</TaskTd>
      <TaskTd rightalign nowrap>
        {!task.ratings.find(
          (rating) => rating.createdByUser === userInfo?.id,
        ) && (
          <StyledButton buttonType="ratenow" onClick={() => rateTask()}>
            Rate now
          </StyledButton>
        )}
        <Button
          className="m-1"
          size="sm"
          variant="primary"
          aria-label="Task details"
          onClick={() => taskDetails()}
        >
          <InfoCircleFill />
        </Button>
        <Button
          className="m-1"
          size="sm"
          variant="warning"
          aria-label="Task ratings"
          onClick={() => taskRatingDetails()}
        >
          <StarFill />
        </Button>
        <Button
          className="m-1"
          size="sm"
          variant="success"
          aria-label="Edit task"
          onClick={() => editTask()}
        >
          <PencilSquare />
        </Button>
        <Button
          className="m-1"
          size="sm"
          variant="danger"
          aria-label="Delete task"
          onClick={() => deleteTask()}
        >
          <TrashFill />
        </Button>
      </TaskTd>
    </tr>
  );
};
