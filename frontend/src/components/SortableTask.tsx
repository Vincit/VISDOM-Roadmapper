import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { Task } from '../redux/roadmaps/types';
import { InfoButton } from './forms/InfoButton';
import { RatingsButton } from './forms/RatingsButton';
import { TaskRatingsText } from './TaskRatingsText';

const TaskDiv = styled.div`
  display: flex;
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 6px;
  background-color: white;
  user-select: none;
`;

const LeftSideDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const RightSideDiv = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  svg {
    margin-left: 8px;
  }
`;

export const SortableTask: React.FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
}> = ({ task, index, disableDragging }) => {
  const dispatch = useDispatch<StoreDispatchType>();

  const taskRatingDetailsClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_RATINGS_INFO_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const taskDetailsClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_INFO_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  return (
    <Draggable
      key={task.id}
      draggableId={`${task.id}`}
      index={index}
      isDragDisabled={disableDragging}
    >
      {(provided) => (
        <TaskDiv
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <LeftSideDiv>
            {task.name}
            <div>
              <TaskRatingsText task={task} />
            </div>
          </LeftSideDiv>
          <RightSideDiv>
            <RatingsButton
              onClick={taskRatingDetailsClicked}
              href={`?openModal=${
                ModalTypes.TASK_RATINGS_INFO_MODAL
              }&modalProps=${encodeURIComponent(
                JSON.stringify({ taskId: task.id }),
              )}`}
            />
            <InfoButton
              onClick={taskDetailsClicked}
              href={`?openModal=${
                ModalTypes.TASK_INFO_MODAL
              }&modalProps=${encodeURIComponent(
                JSON.stringify({ taskId: task.id }),
              )}`}
            />
          </RightSideDiv>
        </TaskDiv>
      )}
    </Draggable>
  );
};
