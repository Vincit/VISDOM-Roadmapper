import { FC } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Task } from '../redux/roadmaps/types';
import { SortableTask } from './SortableTask';
import css from './SortableTaskList.module.scss';

const classes = classNames.bind(css);

export const SortableTaskList: FC<{
  listId: string;
  tasks: Task[];
  disableDragging: boolean;
  isDropDisabled?: boolean;
  showRatings?: boolean;
  className?: string;
}> = ({
  listId,
  tasks,
  disableDragging,
  showRatings,
  className,
  isDropDisabled,
}) => (
  <div className={classes(css.sortableListWrapper, className)}>
    <Droppable
      isDropDisabled={isDropDisabled}
      droppableId={listId}
      type="TASKS"
    >
      {(provided, snapshot) => (
        <div
          className={classes(css.sortableList, {
            [css.highlight]: snapshot.isDraggingOver,
            'loading-cursor': disableDragging,
          })}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {tasks.map((task, index) => (
            <SortableTask
              key={task.id}
              task={task}
              index={index}
              disableDragging={disableDragging}
              showRatings={!!showRatings}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);
