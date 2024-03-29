import { FC } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { DraggableSingleTask, TaskProps } from './TaskMapTask';
import css from './TaskMapTaskGroup.module.scss';

const classes = classNames.bind(css);

export const TaskGroup: FC<
  {
    listId: string;
    taskIds: number[];
    allDependencies: { from: number; to: number }[];
    nodeHeight: number;
  } & Omit<TaskProps, 'taskId' | 'checked'>
> = ({
  listId,
  taskIds,
  allDependencies,
  disableDragging,
  disableDrop,
  setGroupDraggable,
  draggingSomething,
  isLoading,
  nodeHeight,
  ...rest
}) => (
  <Droppable droppableId={listId} type="TASKS">
    {(provided, snapshot) => (
      <div
        className={classes(css.taskGroup, {
          [css.highlight]: snapshot.isDraggingOver,
          [css.loading]: isLoading,
          [css.unavailable]: disableDrop,
          [css.draggingSomething]: draggingSomething,
        })}
        style={{
          ['--nodeHeight' as any]: `${nodeHeight - 23}px`,
        }}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {taskIds.map((taskId, index) => (
          <div key={taskId}>
            <DraggableSingleTask
              taskId={taskId}
              index={index}
              checked={{
                to: allDependencies.some(({ to }) => to === taskId),
                from: allDependencies.some(({ from }) => from === taskId),
              }}
              disableDragging={disableDragging}
              disableDrop={disableDrop}
              setGroupDraggable={setGroupDraggable}
              draggingSomething={draggingSomething}
              isLoading={isLoading}
              {...rest}
            />
          </div>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);
