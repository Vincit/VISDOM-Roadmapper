import { FC, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { Handle, HandleType } from 'react-flow-renderer';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { RootState } from '../redux/types';
import { taskSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';
import css from './TaskMapTask.module.scss';

const classes = classNames.bind(css);

// Node positions require special Position-enum in typescript
export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

export interface TaskProps {
  taskId: number;
  selected?: boolean;
  setSelectedTask?: any;
  checked: { from: boolean; to: boolean };
  disableDragging: boolean;
  unavailable: Set<number>;
  dragHandle?: {
    type: HandleType;
    from: number;
    existingConnections: number[];
  };
}

const SingleTask: FC<
  TaskProps & {
    provided: any;
    snapshot: any;
  }
> = ({
  taskId,
  setSelectedTask,
  selected,
  checked,
  provided,
  snapshot,
  disableDragging,
  unavailable,
  dragHandle,
}) => {
  const { isDragging } = snapshot;
  const task = useSelector<RootState, Task | undefined>(
    taskSelector(taskId),
    shallowEqual,
  );

  const selectTask = (e: MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(selected ? undefined : task);
  };

  if (!task) return null;

  const handle = (type: HandleType) => {
    const left = type === 'target';
    const key = left ? 'to' : 'from';
    const connectable =
      !isDragging &&
      dragHandle &&
      dragHandle.type !== type &&
      !dragHandle.existingConnections.includes(taskId) &&
      !unavailable.has(taskId);
    return (
      /* drag-n-drop is blocked for interactive elements such as buttons */
      <button type="button">
        <Handle
          className={classes(left ? css.leftHandle : css.rightHandle, {
            [css.filled]: checked[key],
            [css.dragging]: isDragging,
            [css.connectable]: connectable,
          })}
          id={`${key}-${taskId}`}
          type={type}
          position={left ? Position.Left : Position.Right}
          isConnectable={connectable}
        />
      </button>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={selectTask}
      onKeyPress={selectTask}
      className={classes(css.singleTask, {
        [css.selectedTask]: selected,
        [css.dragging]: isDragging,
        [css.draggingOutside]: !snapshot.draggingOver,
        [css.loading]: disableDragging && !isDragging,
        [css.unavailable]:
          dragHandle?.from !== taskId && unavailable.has(taskId),
      })}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      {handle('target')}
      {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
      <div
        className={classes(css.taskName, {
          [css.dragging]: isDragging,
        })}
      >
        {task.name}
      </div>
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText
          task={task}
          selected={selected}
          largeIcons
          dragging={isDragging}
        />
      </div>
      {handle('source')}
    </div>
  );
};

export const DraggableSingleTask: FC<
  TaskProps & {
    index: number;
  }
> = ({ taskId, index, disableDragging, ...rest }) => (
  <Draggable
    key={taskId}
    draggableId={`${taskId}`}
    index={index}
    isDragDisabled={disableDragging}
  >
    {(provided, snapshot) => {
      const element = (
        <SingleTask
          taskId={taskId}
          provided={provided}
          snapshot={snapshot}
          disableDragging={disableDragging}
          {...rest}
        />
      );
      return snapshot.isDragging
        ? ReactDOM.createPortal(element, document.getElementById('taskmap')!)
        : element;
    }}
  </Draggable>
);
