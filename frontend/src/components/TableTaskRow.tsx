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
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { roadmapsActions } from '../redux/roadmaps/index';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';

interface TableTaskRowProps {
  task: Task;
}

const ClickableTd = styled.td`
  cursor: pointer;
`;

export const TableTaskRow: React.FC<TableTaskRowProps> = ({ task }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { id, name, completed, roadmapId, description, createdAt } = task;

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
      <ClickableTd onClick={() => toggleTaskCompleted()}>
        {completed ? <CheckCircle /> : <Circle />}
      </ClickableTd>
      <td>{name}</td>
      <td>{description}</td>
      <td>
        <TaskRatingsText task={task} />
      </td>
      <td>{new Date(createdAt).toLocaleDateString()}</td>
      <td>
        <Button
          className="mr-2"
          size="sm"
          variant="primary"
          aria-label="Task details"
          onClick={() => taskDetails()}
        >
          <InfoCircleFill />
        </Button>
        <Button
          className="mr-2"
          size="sm"
          variant="warning"
          aria-label="Rate task"
          onClick={() => rateTask()}
        >
          <StarFill />
        </Button>
        <Button
          className="mr-2"
          size="sm"
          variant="success"
          aria-label="Edit task"
          onClick={() => editTask()}
        >
          <PencilSquare />
        </Button>
        <Button
          size="sm"
          variant="danger"
          aria-label="Delete task"
          onClick={() => deleteTask()}
        >
          <TrashFill />
        </Button>
      </td>
    </tr>
  );
};
