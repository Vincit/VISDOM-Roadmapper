import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import { Link, useParams, useHistory } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { IconButton } from '@material-ui/core';
import { ReactComponent as PreviousTask } from '../icons/expand_less.svg';
import { ReactComponent as NextTask } from '../icons/expand_more.svg';
import { taskSelector } from '../redux/roadmaps/selectors';
import { paths } from '../routers/paths';
import { TaskOverview } from '../components/TaskOverview';
import css from './TaskOverviewPage.module.scss';

const classes = classNames.bind(css);

export const TaskOverviewPage = () => {
  const { roadmapId, taskId } = useParams<{
    roadmapId: string | undefined;
    taskId: string | undefined;
  }>();
  const history = useHistory();
  const task = useSelector(taskSelector(Number(taskId)));

  const siblingTasks = [
    { id: useSelector(taskSelector(Number(taskId) - 1))?.id, type: 'previous' },
    { id: useSelector(taskSelector(Number(taskId) + 1))?.id, type: 'next' },
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
          <div className={classes(css.taskName)}>{task?.name}</div>
          <div className={classes(css.buttons)}>
            {siblingTasks.map(({ id, type }) => (
              <IconButton
                key={id}
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
          {task && <TaskOverview task={task} />}
        </div>
      </div>
    </div>
  );
};
