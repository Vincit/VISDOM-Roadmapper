import { FC, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { Handle, HandleType, Position } from 'react-flow-renderer';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Task } from '../redux/roadmaps/types';
import { completed } from '../utils/TaskUtils';
import css from './TaskMapTask.module.scss';

const classes = classNames.bind(css);

export interface TaskProps {
  taskId: number;
  tasks: Task[];
  selected?: boolean;
  setSelectedTask?: any;
  checked: { from: boolean; to: boolean };
  disableDragging: boolean;
  dropDisabled?: boolean;
  setGroupDraggable: (_: boolean) => unknown;
  unavailable: Set<number>;
  isLoading: boolean;
  draggingSomething: boolean;
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
  tasks,
  setSelectedTask,
  selected,
  checked,
  provided,
  snapshot,
  dropDisabled,
  unavailable,
  dragHandle,
  setGroupDraggable,
  draggingSomething,
  isLoading,
}) => {
  const { isDragging } = snapshot;
  const task = tasks.find(({ id }) => id === taskId);

  const selectTask = (e: MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setSelectedTask(selected ? undefined : task);
  };

  if (!task) return null;

  const connectable =
    !isDragging &&
    dragHandle &&
    !dragHandle.existingConnections.includes(taskId) &&
    !unavailable.has(taskId);

  const handle = (type: HandleType) => {
    const left = type === 'target';
    const key = left ? 'to' : 'from';
    const handleConnectable = connectable && dragHandle?.type !== type;
    return (
      /* drag-n-drop is blocked for interactive elements such as buttons */
      <button type="button">
        <Handle
          className={classes(left ? css.leftHandle : css.rightHandle, {
            [css.filled]: checked[key],
            [css.dragging]: isDragging,
            [css.connecting]: dragHandle,
            [css.connectable]: handleConnectable,
            [css.connectStart]:
              dragHandle?.from === taskId && dragHandle.type === type,
            [css.dropDisabled]: dropDisabled,
            [css.draggingSomething]: draggingSomething,
            [css.loading]: isLoading,
          })}
          id={`${key}-${taskId}`}
          type={type}
          position={left ? Position.Left : Position.Right}
          isConnectable={!isLoading}
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
      onMouseOver={() => setGroupDraggable(false)}
      onMouseLeave={() => setGroupDraggable(true)}
      onFocus={() => setGroupDraggable(false)}
      onBlur={() => setGroupDraggable(true)}
      className={classes(css.singleTask, {
        [css.selectedTask]: selected,
        [css.dragging]: isDragging,
        [css.draggingOutside]: !snapshot.draggingOver,
        [css.unavailable]:
          dragHandle?.from !== taskId && unavailable.has(taskId),
        [css.connecting]: dragHandle,
        [css.connectable]: connectable,
        [css.connectStart]: dragHandle?.from === taskId,
        [css.dropDisabled]: dropDisabled,
        [css.draggingSomething]: draggingSomething,
        [css.loading]: isLoading,
      })}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      {handle('target')}
      {completed(task) && <DoneAllIcon className={classes(css.doneIcon)} />}
      <div
        className={classes(css.taskName, {
          [css.dragging]: isDragging,
        })}
      >
        {task.name}
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
