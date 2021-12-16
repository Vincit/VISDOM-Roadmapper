import { FC } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Task } from '../redux/roadmaps/types';
import { DraggableSingleTask } from './TaskMapTask';
import css from './TaskMapTaskGroup.module.scss';

const classes = classNames.bind(css);

export const TaskGroup: FC<{
  listId: string;
  taskIds: number[];
  selectedTask: Task | undefined;
  setSelectedTask: any;
  allDependencies: { from: number; to: number }[];
  disableDragging: boolean;
}> = ({
  listId,
  taskIds,
  selectedTask,
  setSelectedTask,
  allDependencies,
  disableDragging,
}) => (
  <Droppable droppableId={listId} type="TASKS">
    {(provided, snapshot) => (
      <div
        className={classes(css.taskGroup, {
          [css.highlight]: snapshot.isDraggingOver,
          [css.loading]: disableDragging,
        })}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {taskIds.map((taskId, index) => (
          <div key={taskId}>
            <DraggableSingleTask
              taskId={taskId}
              selected={selectedTask?.id === taskId}
              setSelectedTask={setSelectedTask}
              index={index}
              toChecked={allDependencies.some(({ to }) => to === taskId)}
              fromChecked={allDependencies.some(({ from }) => from === taskId)}
              disableDragging={disableDragging}
            />
          </div>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);
