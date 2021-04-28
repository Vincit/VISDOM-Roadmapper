import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';
import css from './SortableTask.module.scss';

export const SortableTask: React.FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
}> = ({ task, index, disableDragging }) => {
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
          <div className={css.leftSideDiv}>{task.name}</div>
          <div className={css.rightSideDiv}>
            <div>
              {}
              <TaskRatingsText task={task} />
            </div>
            <DragIndicatorIcon />
          </div>
        </div>
      )}
    </Draggable>
  );
};
