import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { Permission } from '../../../shared/types/customTypes';
import { roadmapsActions } from '../redux/roadmaps';
import { StoreDispatchType } from '../redux/index';
import { valueAndWorkSummary, getRatingsByType } from '../utils/TaskUtils';
import { hasPermission } from '../utils/UserUtils';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { allTasksSelector } from '../redux/roadmaps/selectors';
import { userRoleSelector } from '../redux/user/selectors';
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
  const role = useSelector(userRoleSelector, shallowEqual);
  const { roadmapId } = useParams<{
    roadmapId: string | undefined;
  }>();
  const { value, work } = valueAndWorkSummary(task);
  const { value: valueRatings, work: workRatings } = getRatingsByType(
    task.ratings,
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
        editable: hasPermission(role, Permission.TaskEdit),
      },
      {
        label: t('Description'),
        keyName: 'description',
        value: task.description,
        editable: hasPermission(role, Permission.TaskEdit),
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

  const handleEditConfirm = async (newValue: string, fieldId: string) => {
    const req: TaskRequest = {
      id: task.id,
      [fieldId]: newValue,
    };

    const res = await dispatch(roadmapsActions.patchTask(req));
    if (roadmapsActions.patchTask.rejected.match(res)) {
      if (res.payload) {
        return res.payload.message;
      }
    }
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
        onDataEditConfirm={handleEditConfirm}
        key={task.id}
      />
      {hasPermission(role, Permission.RoadmapReadUsers) && (
        <div className={classes(css.ratings)}>
          {valueRatings.length > 0 && (
            <RatingTableValue
              ratings={valueRatings}
              avg={value.avg}
              taskId={task.id}
            />
          )}
          {workRatings.length > 0 && (
            <RatingTableWork
              ratings={workRatings}
              avg={work.avg}
              taskId={task.id}
            />
          )}
        </div>
      )}
    </div>
  );
};

export const TaskOverviewPage = () => {
  const { taskId } = useParams<{
    taskId: string | undefined;
  }>();
  const tasks = useSelector(allTasksSelector, shallowEqual);
  const taskIdx = tasks.findIndex(({ id }) => Number(taskId) === id);
  const task = taskIdx >= 0 ? tasks[taskIdx] : undefined;

  if (!task) return <Redirect to={paths.notFound} />;
  return <TaskOverview tasks={tasks} task={task} taskIdx={taskIdx} />;
};
