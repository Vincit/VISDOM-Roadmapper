import { CSSProperties, FC } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';
import css from './SortableTask.module.scss';

export const StaticTask: FC<{
  task: Task;
  showRatings: boolean;
  provided: DraggableProvided;
  style?: CSSProperties;
}> = ({ task, showRatings, provided, style }) => (
  <div
    className={css.taskDiv}
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    style={{ ...provided.draggableProps.style, ...(style && { ...style }) }}
  >
    <div className={css.leftSideDiv}>{task.name}</div>
    <div className={css.rightSideDiv}>
      {showRatings && <TaskRatingsText task={task} />}
      <DragIndicatorIcon fontSize="small" />
    </div>
  </div>
);

export const SortableTask: FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
  showRatings: boolean;
  style?: CSSProperties;
}> = ({ task, index, disableDragging, showRatings, style }) => (
  <Draggable
    key={task.id}
    draggableId={`${task.id}`}
    index={index}
    isDragDisabled={disableDragging}
  >
    {(provided) => (
      <StaticTask
        task={task}
        showRatings={showRatings}
        provided={provided}
        style={style}
      />
    )}
  </Draggable>
);
