/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC } from 'react';
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
import { TaskRelationType } from '../../../shared/types/customTypes';
import css from './TaskMapTask.module.scss';

const classes = classNames.bind(css);

// Node positions require special Position-enum in typescript
export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

const SingleTask: FC<{
  taskId: number;
  selected?: boolean;
  setSelectedTask?: any;
  toChecked: boolean;
  provided: any;
  snapshot: any;
}> = ({ taskId, setSelectedTask, selected, toChecked, provided, snapshot }) => {
  const task = useSelector<RootState, Task | undefined>(
    taskSelector(taskId),
    shallowEqual,
  );
  const fromRelations = task?.relations.some(
    (relation) =>
      relation.type === TaskRelationType.Dependency &&
      relation.from === task?.id,
  );

  if (!task) return null;
  return (
    <div
      role="button"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedTask(selected ? undefined : task);
      }}
      className={classes(css.singleTask, {
        [css.selectedTask]: selected,
        [css.dragging]: snapshot.isDragging,
      })}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <Handle
        className={classes(css.leftHandle, {
          [css.filledLeftHandle]: toChecked,
          [css.dragging]: snapshot.isDragging,
        })}
        id={`to-${task!.id}`}
        type="target"
        position={Position.Left}
      />
      {task!.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
      {task!.name}
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText
          task={task!}
          selected={selected}
          largeIcons
          dragging={snapshot.isDragging}
        />
      </div>
      <Handle
        className={classes(css.rightHandle, {
          [css.filledRightHandle]: fromRelations,
          [css.dragging]: snapshot.isDragging,
        })}
        id={`from-${task!.id}`}
        type="source"
        position={Position.Right}
      />
    </div>
  );
};

export const DraggableSingleTask: FC<{
  taskId: number;
  selected?: boolean;
  setSelectedTask?: any;
  index: number;
  toChecked: boolean;
}> = ({ taskId, setSelectedTask, selected, index, toChecked }) => (
  <Draggable key={taskId} draggableId={`${taskId}`} index={index}>
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
        />
      );
    }}
  </Draggable>
);
