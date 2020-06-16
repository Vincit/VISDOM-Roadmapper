import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import {
  TrashFill,
  CheckCircle,
  Circle,
  PencilSquare,
} from 'react-bootstrap-icons';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps/index';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { Task } from '../redux/roadmaps/types';

interface TableTaskRowProps {
  task: Task;
}

const ClickableTd = styled.td`
  cursor: pointer;
`;

export const TableTaskRow: React.FC<TableTaskRowProps> = ({ task }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const {
    id,
    name,
    completed,
    roadmapId,
    requiredBy,
    description,
    createdAt,
  } = task;

  const deleteTask = () => {
    dispatch(roadmapsActions.deleteTask({ id, roadmapId }));
  };

  const editTask = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_TASK_MODAL,
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
      <td>{requiredBy || '-'}</td>
      <td>{new Date(createdAt).toLocaleDateString()}</td>
      <td>
        <Button
          className="mr-3"
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
