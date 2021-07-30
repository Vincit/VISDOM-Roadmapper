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
}> = ({ listId, tasks, disableDragging }) => {
  return (
    <Droppable droppableId={listId} type="TASKS">
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
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
