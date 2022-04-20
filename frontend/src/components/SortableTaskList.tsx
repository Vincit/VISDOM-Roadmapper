import {
  CSSProperties,
  FC,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { VariableSizeList } from 'react-window';
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
  const listRef = useRef<VariableSizeList<any> | null>(null);
  const [measureRef, setMeasureRef] = useState<HTMLDivElement | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  useEffect(() => {
    setSearched(
      tasks.filter(({ name }) => name.toLowerCase().includes(search)),
    );
  }, [search, tasks]);

  useEffect(() => {
    if (!measureRef) return;
    const heights = searched.map(({ name }) => {
      measureRef.textContent = name;
      const textHeight = measureRef.offsetHeight;
      measureRef.textContent = '';

      return 22 + textHeight; // 22 = margin + padding
    });
    setRowHeights(heights);
    listRef.current!.resetAfterIndex(0);
  }, [searched, measureRef]);

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
                <VariableSizeList
                  height={height}
                  width={width}
                  ref={listRef}
                  itemCount={searched.length}
                  itemSize={(idx) => rowHeights[idx] ?? 0}
                  outerRef={provided.innerRef}
                  itemData={searched}
                >
                  {Row}
                </VariableSizeList>
              )}
            </AutoSizer>
            {searched.length > 0 && (
              <StaticTask
                ref={setMeasureRef}
                className="measure"
                showRatings={!!showRatings}
                task={searched[0]}
              />
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
