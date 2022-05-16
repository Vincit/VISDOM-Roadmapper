import { FC, CSSProperties, ComponentPropsWithoutRef } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useHistory } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { FixedSizeList } from 'react-window';
import classNames from 'classnames';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { TaskStatus } from '../../../shared/types/customTypes';
import { paths } from '../routers/paths';
import { TaskRatingsText } from './TaskRatingsText';
import { apiV2 } from '../api/api';
import css from './TaskTable.module.scss';

const classes = classNames.bind(css);

export const TaskRow: FC<{
  task: Task;
  style?: CSSProperties;
  largeIcons?: true;
  onClick?: () => unknown;
  showMilestoneName?: boolean;
}> = ({ task, style, largeIcons, onClick, showMilestoneName }) => {
  const history = useHistory();
  const toTask = `${paths.roadmapHome}/${task.roadmapId}${paths.roadmapRelative.tasks}/${task.id}`;
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: versions } = apiV2.useGetVersionsQuery(roadmapId ?? skipToken, {
    skip: !showMilestoneName,
  });
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
      <div className={classes(css.namesContainer)}>
        <div>
          {task.status === TaskStatus.COMPLETED && (
            <DoneAllIcon className={classes(css.doneIcon)} />
          )}
          <div className={classes(css.taskName)}>{task.name}</div>
        </div>
        {showMilestoneName && (
          <div className={classes(css.milestoneName)}>
            {versions?.find((v) => v.tasks.some((t) => t.id === task.id))
              ?.name ?? 'Unordered'}
          </div>
        )}
      </div>
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText task={task} largeIcons={largeIcons} />
      </div>
    </div>
  );
};

// TODO: maybe define these in one place
const taskHeight = 52;
const taskMargin = 6;

export const TaskTable: FC<{
  tasks: Task[];
  height?: number;
}> = ({ tasks, height = 500 }) => (
  <div className={classes(css.listContainer)}>
    {!tasks.length ? (
      <div className={classes(css.noTasks)}>
        <Trans i18nKey="No tasks" />
      </div>
    ) : (
      <FixedSizeList
        itemSize={taskHeight + taskMargin}
        itemCount={tasks.length}
        height={Math.min(height, (taskHeight + taskMargin) * tasks.length)}
        width="100%"
      >
        {({ index, style }) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { height: _, width, ...rest } = style;
          return <TaskRow style={{ ...rest }} task={tasks[index]} />;
        }}
      </FixedSizeList>
    )}
  </div>
);

export const TaskRelationTable: FC<{
  tasks: Task[];
  height?: number;
  Action: FC<{ task: Task }>;
  taskProps?: Omit<ComponentPropsWithoutRef<typeof TaskRow>, 'task'>;
}> = ({ tasks, height = 500, Action, taskProps }) =>
  !tasks.length ? (
    <div className={classes(css.noRelations)}>
      <Trans i18nKey="No relations" />
    </div>
  ) : (
    <div className={classes(css.relationList)} style={{ maxHeight: height }}>
      {tasks.map((t) => (
        <div key={t.id} className={classes(css.relationRow)}>
          <TaskRow task={t} {...taskProps} />
          <Action task={t} />
        </div>
      ))}
    </div>
  );
