import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { roadmapsActions } from '../redux/roadmaps';
import { StoreDispatchType } from '../redux/index';
import { valueAndWorkSummary, getRatingsByType } from '../utils/TaskUtils';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { allTasksSelector } from '../redux/roadmaps/selectors';
import { Task, TaskRequest } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { RatingTableWork } from '../components/RatingTableWork';
import { RatingTableValue } from '../components/RatingTableValue';
import { Overview, ArrowType } from '../components/Overview';
import colors from '../colors.module.scss';
import css from './TaskOverviewPage.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TaskOverview: FC<{
  tasks: Task[];
  task: Task;
  taskIdx: number;
}> = ({ tasks, task, taskIdx }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const { roadmapId } = useParams<{
    roadmapId: string | undefined;
  }>();
  const { value, work } = valueAndWorkSummary(task!);
  const { value: valueRatings, work: workRatings } = getRatingsByType(
    task?.ratings || [],
  );
  const tasksListPage = `${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.taskList}`;

  const siblingTasks = [
    {
      id: taskIdx > 0 ? tasks[taskIdx - 1].id : undefined,
      type: ArrowType.Previous,
    },
    {
      id: taskIdx + 1 < tasks.length ? tasks[taskIdx + 1].id : undefined,
      type: ArrowType.Next,
    },
  ];

  const metrics = [
    {
      label: t('Avg Value'),
      value: numFormat.format(value.avg),
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: t('Avg Work'),
      value: numFormat.format(work.avg),
      children: <WorkRoundIcon color={colors.black100} />,
    },
  ];

  const taskData = [
    [
      {
        label: t('Title'),
        keyName: 'name',
        value: task.name,
        format: 'bold',
        editable: true,
      },
      {
        label: t('Description'),
        keyName: 'description',
        value: task.description,
        editable: true,
      },
    ],
    [
      {
        label: t('Created on'),
        keyName: 'createdAt',
        value: new Date(task.createdAt).toLocaleDateString(),
        format: 'bold',
        editable: false,
      },
      {
        label: t('Status'),
        keyName: 'completed',
        value: task.completed ? 'Completed' : 'Unordered',
        format: task.completed ? 'completed' : 'unordered',
        editable: false,
      },
    ],
  ];

  const handleEdit = async (editedField: string, edited: string) => {
    const req: TaskRequest = {
      id: task.id,
      [editedField]: edited,
    };

    const res = await dispatch(roadmapsActions.patchTask(req));
    if (roadmapsActions.patchTask.rejected.match(res) && res.payload)
      return res.payload.message;
    return '';
  };

  return (
    <div className="overviewContainer">
      <Overview
        backHref={tasksListPage}
        overviewType={t('Task')}
        name={task.name}
        previousAndNext={siblingTasks}
        onOverviewChange={(id) => history.push(`${tasksListPage}/${id}`)}
        metrics={metrics}
        data={taskData}
        onDataEdit={handleEdit}
      />
      <div className={classes(css.ratings)}>
        {valueRatings.length > 0 && (
          <RatingTableValue ratings={valueRatings} avg={value.avg} />
        )}
        {workRatings.length > 0 && (
          <RatingTableWork ratings={workRatings} avg={work.avg} />
        )}
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
  return <TaskOverview tasks={tasks} task={task} taskIdx={taskIdx} />;
};
