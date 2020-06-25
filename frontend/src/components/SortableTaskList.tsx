import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { Task } from '../redux/roadmaps/types';
import { SortableTask } from './SortableTask';

const ListDiv = styled.div`
  background-color: rgb(240, 240, 240);
  padding: 0.5em;
  border: 2px solid black;
  margin: auto;
  margin-top: 1em;
  min-width: 20em;
`;

export const SortableTaskList: React.FC<{ listId: string; tasks: Task[] }> = ({
  listId,
  tasks,
}) => {
  return (
    <ListDiv>
      <Droppable droppableId={listId}>
        {(provided) => (
          <div ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <SortableTask task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </ListDiv>
  );
};
