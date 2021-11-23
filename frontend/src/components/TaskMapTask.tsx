import { FC, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { Handle } from 'react-flow-renderer';
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

interface TaskProps {
  taskId: number;
  selected?: boolean;
  setSelectedTask?: any;
  toChecked: boolean;
  fromChecked: boolean;
  disableDragging: boolean;
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
  toChecked,
  fromChecked,
  provided,
  snapshot,
  disableDragging,
}) => {
  const task = useSelector<RootState, Task | undefined>(
    taskSelector(taskId),
    shallowEqual,
  );

  const selectTask = (e: MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(selected ? undefined : task);
  };

  if (!task) return null;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={selectTask}
      onKeyPress={selectTask}
      className={classes(css.singleTask, {
        [css.selectedTask]: selected,
        [css.dragging]: snapshot.isDragging,
        [css.draggingOutside]: !snapshot.draggingOver,
        [css.loading]: disableDragging && !snapshot.isDragging,
      })}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      {/* drag-n-drop is blocked for interactive elements such as buttons */}
      <button type="button">
        <Handle
          className={classes(css.leftHandle, {
            [css.filledLeftHandle]: toChecked,
            [css.dragging]: snapshot.isDragging,
          })}
          id={`to-${task.id}`}
          type="target"
          position={Position.Left}
        />
      </button>
      {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
      {task.name}
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText
          task={task}
          selected={selected}
          largeIcons
          dragging={snapshot.isDragging}
        />
      </div>
      <button type="button">
        <Handle
          className={classes(css.rightHandle, {
            [css.filledRightHandle]: fromChecked,
            [css.dragging]: snapshot.isDragging,
          })}
          id={`from-${task.id}`}
          type="source"
          position={Position.Right}
        />
      </button>
    </div>
  );
};

export const DraggableSingleTask: FC<
  TaskProps & {
    index: number;
  }
> = ({
  taskId,
  setSelectedTask,
  selected,
  index,
  toChecked,
  fromChecked,
  disableDragging,
}) => (
  <Draggable
    key={taskId}
    draggableId={`${taskId}`}
    index={index}
    isDragDisabled={disableDragging}
  >
    {(provided, snapshot) => {
      if (snapshot.isDragging)
        return ReactDOM.createPortal(
          <SingleTask
            taskId={taskId}
            selected={selected}
            setSelectedTask={setSelectedTask}
            snapshot={snapshot}
            provided={provided}
            toChecked={toChecked}
            fromChecked={fromChecked}
            disableDragging={disableDragging}
          />,
          document.getElementById('taskmap')!,
        );
      return (
        <SingleTask
          taskId={taskId}
          selected={selected}
          setSelectedTask={setSelectedTask}
          snapshot={snapshot}
          provided={provided}
          toChecked={toChecked}
          fromChecked={fromChecked}
          disableDragging={disableDragging}
        />
      );
    }}
  </Draggable>
);
