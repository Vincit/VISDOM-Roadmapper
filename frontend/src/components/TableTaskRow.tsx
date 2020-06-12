import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { CheckAll } from 'react-bootstrap-icons';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps/index';

interface TableTaskRowProps {
  id: number;
  name: string;
  description: string;
  roadmapId: number;
  completed: boolean;
  createdAt: string;
  requiredBy: string;
}

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

  return (
    <tr>
      <td>
        {completed ? <CheckAll /> : <span aria-hidden="true">&times;</span>}
      </td>
      <td>{name}</td>
      <td>{description}</td>
      <td>{requiredBy || 'N/A'}</td>
      <td>{createdAt}</td>
      <td>
        <Button
          size="sm"
          variant="danger"
          aria-label="Delete task"
          onClick={() => deleteTask()}
        >
          <span aria-hidden="true">&times;</span>
        </Button>
      </td>
    </tr>
  );
};
