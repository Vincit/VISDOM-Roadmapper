import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Task } from '../redux/roadmaps/types';
import { SortableTask } from './SortableTask';
import { SearchField } from './SearchField';
import css from './SortableTaskList.module.scss';

const classes = classNames.bind(css);

export const SortableTaskList: FC<{
  listId: string;
  tasks: Task[];
  disableDragging: boolean;
  isDropDisabled?: boolean;
  showRatings?: boolean;
  showSearch?: boolean;
  className?: string;
}> = ({
  listId,
  tasks,
  disableDragging,
  showRatings,
  showSearch,
  className,
  isDropDisabled,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  return (
    <div className={classes(css.sortableListWrapper, className)}>
      {showSearch && (
        <div className={classes(css.searchField)}>
          <SearchField
            placeholder={t('Search for type', { searchType: 'tasks' })}
            onChange={setSearch}
          />
        </div>
      )}
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
            {tasks
              .filter(({ name }) => name.toLowerCase().includes(search))
              .map((task, index) => (
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
};
