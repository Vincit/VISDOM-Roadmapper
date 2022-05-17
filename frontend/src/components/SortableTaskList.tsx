import { CSSProperties, FC, useEffect, useState, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { useTranslation } from 'react-i18next';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Task } from '../redux/roadmaps/types';
import { SortableTask, StaticTask } from './SortableTask';
import { SearchField } from './SearchField';
import css from './SortableTaskList.module.scss';

const classes = classNames.bind(css);

type RowProps = {
  data: Task[];
  index: number;
  style: CSSProperties;
};

export const SortableTaskList: FC<{
  listId: string;
  tasks: Task[];
  disableDragging: boolean;
  isDropDisabled?: boolean;
  showRatings?: boolean;
  hideDragIndicator?: boolean;
  showSearch?: boolean;
  className?: string;
}> = ({
  listId,
  tasks,
  disableDragging,
  showRatings,
  hideDragIndicator,
  showSearch,
  className,
  isDropDisabled,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(tasks);
  const itemHeight = 52; // enough for two lines for the task name
  const itemMargin = 6;

  useEffect(() => {
    setSearched(
      tasks.filter(({ name }) => name.toLowerCase().includes(search)),
    );
  }, [search, tasks]);

  const Row = useCallback(
    ({ data, index, style }: RowProps) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { height: _, ...rest } = style;
      return (
        <SortableTask
          style={{ ...rest }}
          key={data[index].id}
          task={data[index]}
          index={index}
          height={itemHeight}
          disableDragging={disableDragging}
          showRatings={!!showRatings}
          hideDragIndicator={hideDragIndicator}
        />
      );
    },
    [disableDragging, hideDragIndicator, showRatings],
  );

  return (
    <div className={classes(css.sortableListWrapper, className)}>
      {showSearch && (
        <div className={classes(css.searchField)}>
          <SearchField
            placeholder={t('Search for type', { searchType: 'tasks' })}
            onChange={setSearch}
            searchThreshold={0}
          />
        </div>
      )}
      <Droppable
        isDropDisabled={isDropDisabled}
        droppableId={listId}
        type="TASKS"
        mode="virtual"
        renderClone={(provided, _, rubric) => (
          <StaticTask
            task={searched[rubric.source.index]}
            showRatings={!!showRatings}
            provided={provided}
          />
        )}
      >
        {(provided, snapshot) => (
          <div
            className={classes(css.sortableList, {
              [css.highlight]: snapshot.isDraggingOver,
              [css.notAllowed]: isDropDisabled,
            })}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  height={height}
                  width={width}
                  itemCount={searched.length}
                  itemSize={itemHeight + itemMargin}
                  outerRef={provided.innerRef}
                  itemData={searched}
                >
                  {Row}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
        )}
      </Droppable>
    </div>
  );
};
