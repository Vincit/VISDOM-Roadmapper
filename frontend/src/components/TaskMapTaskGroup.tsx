import { FC } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Task } from '../redux/roadmaps/types';
import { DraggableSingleTask, TaskProps } from './TaskMapTask';
import css from './TaskMapTaskGroup.module.scss';

const classes = classNames.bind(css);

export const TaskGroup: FC<
  {
    listId: string;
    taskIds: number[];
    selectedTask: Task | undefined;
    setSelectedTask: any;
    allDependencies: { from: number; to: number }[];
    disableDrop?: boolean;
    setGroupDraggable: any;
  } & Omit<TaskProps, 'taskId' | 'checked'>
> = ({
  listId,
  taskIds,
  selectedTask,
  allDependencies,
  disableDragging,
  disableDrop,
  setGroupDraggable,
  ...rest
}) => (
  <Droppable isDropDisabled={disableDrop} droppableId={listId} type="TASKS">
    {(provided, snapshot) => (
      <div
        className={classes(css.taskGroup, {
          [css.highlight]: snapshot.isDraggingOver,
          [css.loading]: disableDragging,
          [css.unavailable]: disableDrop,
        })}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {taskIds.map((taskId, index) => (
          <div key={taskId}>
            <DraggableSingleTask
              taskId={taskId}
              selected={selectedTask?.id === taskId}
              index={index}
              checked={{
                to: allDependencies.some(({ to }) => to === taskId),
                from: allDependencies.some(({ from }) => from === taskId),
              }}
              disableDragging={disableDragging}
              dropDisabled={disableDrop}
              setGroupDraggable={setGroupDraggable}
              {...rest}
            />
          </div>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);
