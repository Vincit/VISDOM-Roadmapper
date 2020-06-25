import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { Task } from '../redux/roadmaps/types';

const TaskDiv = styled.div`
  border: 1px solid black;
  border-radius: 0.3em;
  padding: 5px;
  margin-bottom: 5px;
  background-color: white !important;
  user-select: none;
`;

export const SortableTask: React.FC<{
  task: Task;
  index: number;
}> = ({ task, index }) => {
  return (
    <Draggable key={task.id} draggableId={`${task.id}`} index={index}>
      {(provider) => (
        <TaskDiv
          ref={provider.innerRef}
          {...provider.draggableProps}
          {...provider.dragHandleProps}
        >
          {task.name}
        </TaskDiv>
      )}
    </Draggable>
  );
};
