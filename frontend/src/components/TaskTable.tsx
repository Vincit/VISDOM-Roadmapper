import { FC, CSSProperties, useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Task } from '../redux/roadmaps/types';
import { TaskStatus } from '../../../shared/types/customTypes';
import { paths } from '../routers/paths';
import { TaskRatingsText } from './TaskRatingsText';
import css from './TaskTable.module.scss';

const classes = classNames.bind(css);

export const TaskRow: FC<{
  task: Task;
  style?: CSSProperties;
  largeIcons?: true;
  onClick?: () => unknown;
}> = ({ task, style, largeIcons, onClick }) => {
  const history = useHistory();
  const toTask = `${paths.roadmapHome}/${task.roadmapId}${paths.roadmapRelative.tasks}/${task.id}`;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        onClick?.();
        history.push(toTask);
      }}
      onKeyPress={() => {
        onClick?.();
        history.push(toTask);
      }}
      style={style}
      className={classes(css.task)}
    >
      {task.status === TaskStatus.COMPLETED && (
        <DoneAllIcon className={classes(css.doneIcon)} />
      )}
      <div className={classes(css.taskName)}>{task.name}</div>
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText task={task} largeIcons={largeIcons} />
      </div>
    </div>
  );
};

export const TaskTable: FC<{
  tasks: Task[];
  height?: number;
}> = ({ tasks, height = 500 }) => {
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
      {!tasks.length ? (
        <div className={classes(css.noTasks)}>
          <Trans i18nKey="No tasks" />
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
            return <TaskRow style={{ ...rest }} task={tasks[index]} />;
          }}
        </VariableSizeList>
      )}
      <div ref={setDivRef} className={classes(css.measureTaskName)} />
    </div>
  );
};
