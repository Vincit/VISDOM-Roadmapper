import { FC } from 'react';
import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';
import { Trans } from 'react-i18next';
import { Link, useParams, useHistory, Redirect } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { IconButton } from '@material-ui/core';
import { ReactComponent as PreviousTask } from '../icons/expand_less.svg';
import { ReactComponent as NextTask } from '../icons/expand_more.svg';
import { allTasksSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { TaskOverview } from '../components/TaskOverview';
import { RatingTableWork } from '../components/RatingTableWork';
import { RatingTableValue } from '../components/RatingTableValue';
import { valueAndWorkSummary, getRatingsByType } from '../utils/TaskUtils';
import css from './TaskOverviewPage.module.scss';

const classes = classNames.bind(css);

const TaskOverviewContent: FC<{
  tasks: Task[];
  task: Task;
  taskIdx: number;
}> = ({ tasks, task, taskIdx }) => {
  const { roadmapId } = useParams<{
    roadmapId: string | undefined;
  }>();
  const history = useHistory();
  const { value, work } = valueAndWorkSummary(task!);
  const { value: valueRatings, work: workRatings } = getRatingsByType(
    task?.ratings || [],
  );

  const siblingTasks = [
    {
      id: taskIdx > 0 ? tasks[taskIdx - 1].id : undefined,
      type: 'previous',
    },
    {
      id: taskIdx + 1 < tasks.length ? tasks[taskIdx + 1].id : undefined,
      type: 'next',
    },
  ];

  const changeTask = (toTaskId: number) =>
    history.push(
      `${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.taskList}/${toTaskId}`,
    );

  return (
    <div className={classes(css.overviewContainer)}>
      <div className={classes(css.section)}>
        <div className={classes(css.header)}>
          <Link
            to={`${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.taskList}`}
          >
            <ArrowBackIcon className={classes(css.arrowIcon)} />
          </Link>
          <Trans i18nKey="Task overview" />
          <div className={classes(css.taskName)}>{task.name}</div>
          <div className={classes(css.buttons)}>
            {siblingTasks.map(({ id, type }) => (
              <IconButton
                key={type}
                className={classes({ [css.disabled]: !id })}
                disabled={!id}
                onClick={() => changeTask(id!)}
              >
                {type === 'previous' ? <PreviousTask /> : <NextTask />}
              </IconButton>
            ))}
          </div>
        </div>
        <div className={classes(css.content)}>
          <TaskOverview task={task} />
        </div>
        <div className={classes(css.ratings)}>
          {valueRatings.length > 0 && (
            <RatingTableValue ratings={valueRatings} avg={value.avg} />
          )}
          {workRatings.length > 0 && (
            <RatingTableWork ratings={workRatings} avg={work.avg} />
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskOverviewPage = () => {
  const { taskId } = useParams<{
    taskId: string | undefined;
  }>();
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const taskIdx = tasks.findIndex(({ id }) => Number(taskId) === id);
  const task = taskIdx >= 0 ? tasks[taskIdx] : undefined;

  if (!task) return <Redirect to={paths.notFound} />;
  return <TaskOverviewContent tasks={tasks} task={task} taskIdx={taskIdx} />;
};
