import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled, { css } from 'styled-components';
import { Task } from '../redux/roadmaps/types';
import { SortableTask } from './SortableTask';

const ListDiv = styled.div<{ loadingCursor?: boolean; highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: visible;
  background-color: rgba(0, 0, 0, 0);
  width: 100%;
  cursor: ${(props) => (props.loadingCursor ? 'wait !important' : 'auto')};
  ${({ highlight }) =>
    highlight &&
    css`
      box-shadow: 0px 0px 20px rgba(0, 60, 250, 0.15);
      background-color: rgba(0, 60, 250, 0.045);
    `};
`;

export const SortableTaskList: React.FC<{
  listId: string;
  tasks: Task[];
  disableDragging: boolean;
}> = ({ listId, tasks, disableDragging }) => {
  return (
    <Droppable droppableId={listId}>
      {(provided, snapshot) => (
        <ListDiv
          ref={provided.innerRef}
          {...provided.droppableProps}
          highlight={snapshot.isDraggingOver}
        >
          {tasks.map((task, index) => (
            <SortableTask
              key={task.id}
              task={task}
              index={index}
              disableDragging={disableDragging}
            />
          ))}
          {provided.placeholder}
        </ListDiv>
      )}
    </Droppable>
  );
};
