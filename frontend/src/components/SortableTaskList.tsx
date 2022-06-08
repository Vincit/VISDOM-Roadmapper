import {
  CSSProperties,
  FC,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { FixedSizeList } from 'react-window';
import { useTranslation } from 'react-i18next';
import { Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
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
  showInfoIcon?: boolean;
  hideDragIndicator?: boolean;
  showSearch?: boolean;
  className?: string;
}> = ({
  listId,
  tasks,
  disableDragging,
  showRatings,
  showInfoIcon,
  hideDragIndicator,
  showSearch,
  className,
  isDropDisabled,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(tasks);
  const [listHeight, setListHeight] = useState(0);
  const itemHeight = 52; // enough for two lines for the task name
  const itemMargin = 6;
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearched(
      tasks.filter(({ name }) => name.toLowerCase().includes(search)),
    );
  }, [search, tasks]);

  useEffect(() => {
    if (divRef.current) setListHeight(divRef.current.clientHeight);
  }, []);

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
          showInfoIcon={!!showInfoIcon}
          hideDragIndicator={hideDragIndicator}
        />
      );
    },
    [disableDragging, hideDragIndicator, showInfoIcon, showRatings],
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
      <div ref={divRef} className={classes(css.droppableContainer)}>
        <Droppable
          isDropDisabled={isDropDisabled}
          droppableId={listId}
          type="TASKS"
          mode="virtual"
          renderClone={(provided, _, rubric) => (
            <StaticTask
              task={searched[rubric.source.index]}
              showRatings={!!showRatings}
              showInfoIcon={!!showInfoIcon}
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
              <FixedSizeList
                height={listHeight}
                width="100%"
                itemCount={searched.length}
                itemSize={itemHeight + itemMargin}
                outerRef={provided.innerRef}
                itemData={searched}
              >
                {Row}
              </FixedSizeList>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
