import { CSSProperties, FC, forwardRef } from 'react';
import classNames from 'classnames';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';
import css from './SortableTask.module.scss';

const classes = classNames.bind(css);

export const StaticTask = forwardRef<
  HTMLDivElement,
  {
    task: Task;
    showRatings: boolean;
    hideDragIndicator?: boolean;
    provided?: DraggableProvided;
    style?: CSSProperties;
    className?: string;
  }
>(
  (
    { task, showRatings, hideDragIndicator, provided, style, className },
    ref,
  ) => (
    <div
      className={classes(css.taskDiv, className)}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps.style, ...(style && { ...style }) }}
    >
      <div className={css.leftSideDiv} ref={ref}>
        {task.name}
      </div>
      <div className={css.rightSideDiv}>
        {showRatings && <TaskRatingsText task={task} />}
        {!hideDragIndicator && <DragIndicatorIcon fontSize="small" />}
      </div>
    </div>
  ),
);

export const SortableTask: FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
  showRatings: boolean;
  hideDragIndicator?: boolean;
  style?: CSSProperties;
}> = ({
  task,
  index,
  disableDragging,
  showRatings,
  hideDragIndicator,
  style,
}) => (
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
        hideDragIndicator={hideDragIndicator}
      />
    )}
  </Draggable>
);
