import { FC, CSSProperties, useRef, useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Trans } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import CachedIcon from '@material-ui/icons/Cached';
import ClockIcon from '@material-ui/icons/Schedule';
import CheckIcon from '@material-ui/icons/Check';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { tasksByRelationSelector } from '../redux/roadmaps/selectors';
import { TaskRelationTableType } from '../utils/TaskRelationUtils';
import { TaskRatingsText } from './TaskRatingsText';
import css from './TaskRelationTable.module.scss';

const classes = classNames.bind(css);

interface RelationTableDef {
  type: TaskRelationTableType;
}

type RelationTableProps = {
  task: Task;
  height?: number;
};

const RelationRow: FC<{
  task: Task;
  style?: CSSProperties;
}> = ({ task, style }) => (
  <div style={style} className={classes(css.task)}>
    {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
    <div className={classes(css.taskName)}>{task.name}</div>
    <div className={classes(css.taskRatingTexts)}>
      <TaskRatingsText task={task} largeIcons />
    </div>
  </div>
);

const relationTable: (def: RelationTableDef) => FC<RelationTableProps> = ({
  type,
}) => ({ task, height = 500 }) => {
  const tasks = useSelector<RootState, Task[]>(
    tasksByRelationSelector(task.id, type),
    shallowEqual,
  );
  const listRef = useRef<VariableSizeList<any> | null>(null);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    if (!divRef || !tasks.length) return;
    const heights = tasks.map(({ name }) => {
      let taskHeight = 28; // padding + margin
      // calculate text height
      divRef.textContent = name;
      taskHeight += divRef.offsetHeight;
      divRef.textContent = '';
      return taskHeight;
    });
    setRowHeights(heights);
    setListHeight(heights.reduce((a, b) => a + b, 0));
    listRef.current!.resetAfterIndex(0);
  }, [tasks, divRef]);

  return (
    <div className={classes(css.listContainer)}>
      <div
        className={classes(
          css.titleContainer,
          css[TaskRelationTableType[type]],
        )}
      >
        {type === TaskRelationTableType.Requires && <ClockIcon />}
        {type === TaskRelationTableType.Precedes && <CheckIcon />}
        {type === TaskRelationTableType.Contributes && <CachedIcon />}
        <h3>
          <Trans i18nKey={TaskRelationTableType[type]} />
        </h3>
      </div>
      {!tasks.length ? (
        <div className={classes(css.noRelations)}>
          <Trans i18nKey="No relations" />
        </div>
      ) : (
        <VariableSizeList
          ref={listRef}
          itemSize={(idx) => rowHeights[idx] ?? 0}
          itemCount={tasks.length}
          height={Math.min(height, listHeight)}
          width="100%"
        >
          {({ index, style }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { height: _, width, ...rest } = style;
            return <RelationRow style={{ ...rest }} task={tasks[index]} />;
          }}
        </VariableSizeList>
      )}
      <div ref={setDivRef} className={classes(css.measureTaskName)} />
    </div>
  );
};

export const RelationTableRequires = relationTable({
  type: TaskRelationTableType.Requires,
});

export const RelationTablePrecedes = relationTable({
  type: TaskRelationTableType.Precedes,
});

export const RelationTableContributes = relationTable({
  type: TaskRelationTableType.Contributes,
});
