import { FC } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';
import css from './SortableTask.module.scss';

export const SortableTask: FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
  showRatings: boolean;
}> = ({ task, index, disableDragging, showRatings }) => (
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
          {showRatings && <TaskRatingsText task={task} />}
          <DragIndicatorIcon fontSize="small" />
        </div>
      </div>
    )}
  </Draggable>
);
