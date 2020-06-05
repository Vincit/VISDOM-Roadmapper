import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps/index';

interface TableTaskRowProps {
  id: number;
  name: string;
  description: string;
  roadmapId: number;
}

export const TableTaskRow: React.FC<TableTaskRowProps> = ({
  id,
  name,
  description,
  roadmapId,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();

  const deleteTask = () => {
    dispatch(roadmapsActions.deleteTask({ id, roadmapId }));
  };

  return (
    <tr>
      <td>{name}</td>
      <td>{description}</td>
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
