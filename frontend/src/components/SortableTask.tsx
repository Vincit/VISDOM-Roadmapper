import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { Task } from '../redux/roadmaps/types';
import { InfoButton } from './forms/InfoButton';
import { RatingsButton } from './forms/RatingsButton';
import { TaskRatingsText } from './TaskRatingsText';
import css from './SortableTask.module.scss';

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
        <div
          className={css.taskDiv}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={css.leftSideDiv}>
            {task.name}
            <div>
              <TaskRatingsText task={task} />
            </div>
          </div>
          <div className={css.rightSideDiv}>
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
          </div>
        </div>
      )}
    </Draggable>
  );
};
