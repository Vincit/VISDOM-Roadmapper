import { FC, CSSProperties, useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useHistory } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import CachedIcon from '@mui/icons-material/Cached';
import ClockIcon from '@mui/icons-material/Schedule';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Task } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import {
  TaskRelationTableType,
  getTaskRelations,
} from '../utils/TaskRelationUtils';
import { TaskRatingsText } from './TaskRatingsText';
import css from './TaskRelationTable.module.scss';
import { apiV2 } from '../api/api';

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
}> = ({ task, style }) => {
  const history = useHistory();
  const toTask = `${paths.roadmapHome}/${task.roadmapId}${paths.roadmapRelative.tasks}/task/${task.id}`;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => history.push(toTask)}
      onKeyPress={() => history.push(toTask)}
      style={style}
      className={classes(css.task)}
    >
      {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
      <div className={classes(css.taskName)}>{task.name}</div>
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText task={task} largeIcons />
      </div>
    </div>
  );
};

const relationTable: (def: RelationTableDef) => FC<RelationTableProps> = ({
  type,
}) => ({ task, height = 500 }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: relations } = apiV2.useGetTaskRelationsQuery(
    roadmapId ?? skipToken,
  );
  const { data: allTasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const listRef = useRef<VariableSizeList<any> | null>(null);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [listHeight, setListHeight] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (relations && allTasks) {
      const ids = getTaskRelations(task.id, relations, type);
      setTasks(allTasks.filter(({ id }) => ids.has(id)));
    }
  }, [relations, allTasks, task.id]);

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
