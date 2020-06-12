import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import { TrashFill, CheckCircle, Circle } from 'react-bootstrap-icons';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps/index';

interface TableTaskRowProps {
  id: number;
  name: string;
  description: string;
  roadmapId: number;
  completed: boolean;
  createdAt: Date;
  requiredBy: string;
}

const ClickableTd = styled.td`
  cursor: pointer;
`;

export const TableTaskRow: React.FC<TableTaskRowProps> = ({
  id,
  name,
  description,
  roadmapId,
  completed,
  requiredBy,
  createdAt,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();

  const deleteTask = () => {
    dispatch(roadmapsActions.deleteTask({ id, roadmapId }));
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
      <td>{createdAt.toLocaleDateString()}</td>
      <td>
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
