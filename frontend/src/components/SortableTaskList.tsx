import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { Task } from '../redux/roadmaps/types';
import { SortableTask } from './SortableTask';

const ListDiv = styled.div`
  overflow-y: visible;
  padding: 0.5em;
  width: 100%;
  min-width: 100%;
  min-height: 100%;
  border: 1px solid black;
`;

export const SortableTaskList: React.FC<{ listId: string; tasks: Task[] }> = ({
  listId,
  tasks,
}) => {
  return (
    <Droppable droppableId={listId}>
      {(provided) => (
        <ListDiv ref={provided.innerRef} {...provided.droppableProps}>
          {tasks.map((task, index) => (
            <SortableTask key={task.id} task={task} index={index} />
          ))}
          {provided.placeholder}
        </ListDiv>
      )}
    </Droppable>
  );
};
