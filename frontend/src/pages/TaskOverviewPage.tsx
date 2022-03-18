import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
// useTranslation is a hook and thus can't be used in a function
import i18n from 'i18next';
import { useSelector, shallowEqual } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { Permission, TaskStatus } from '../../../shared/types/customTypes';
import {
  valueAndComplexitySummary,
  getRatingsByType,
  taskStatusToText,
} from '../utils/TaskUtils';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { userInfoSelector, userRoleSelector } from '../redux/user/selectors';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { RatingTableComplexity } from '../components/RatingTableComplexity';
import { RatingTableValue } from '../components/RatingTableValue';
import {
  RelationTableRequires,
  RelationTableContributes,
  RelationTablePrecedes,
} from '../components/TaskRelationTable';
import { Overview, ArrowType } from '../components/Overview';
import { hasPermission } from '../../../shared/utils/permission';
import colors from '../colors.module.scss';
import css from './TaskOverviewPage.module.scss';
import { MissingRatings } from '../components/MissingRatings';
import { TaskModalButtons } from '../components/TaskModalButtons';
import { apiV2 } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const getTaskOverviewData = (task: Task, editable: boolean) => {
  const { value, complexity } = valueAndComplexitySummary(task);
  const metrics = [
    {
      label: i18n.t('Avg Value'),
      value: numFormat.format(value.avg),
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: i18n.t('Avg Complexity'),
      value: numFormat.format(complexity.avg),
      children: <WorkRoundIcon color={colors.black100} />,
    },
  ];

  const data = [
    [
      {
        label: i18n.t('Title'),
        keyName: 'name',
        value: task.name,
        format: 'bold',
        editable,
      },
      {
        label: i18n.t('Description'),
        keyName: 'description',
        value: task.description,
        editable,
      },
    ],
    [
      {
        label: i18n.t('Created on'),
        keyName: 'createdAt',
        value: new Date(task.createdAt).toLocaleDateString(),
        format: 'bold',
        editable: false,
      },
      {
        label: i18n.t('Status'),
        keyName: 'status',
        value: taskStatusToText(task.status),
        format: TaskStatus[task.status],
        editable: false,
      },
    ],
  ];
  return { metrics, data };
};

const TaskOverview: FC<{
  tasks: Task[];
  task: Task;
  taskIdx: number;
}> = ({ tasks, task, taskIdx }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const role = useSelector(userRoleSelector, shallowEqual);
  const { id: userId } = useSelector(userInfoSelector, shallowEqual)!;
  const { roadmapId } = useParams<{
    roadmapId: string | undefined;
  }>();
  const { value, complexity } = valueAndComplexitySummary(task);
  const {
    value: valueRatings,
    complexity: complexityRatings,
  } = getRatingsByType(task?.ratings || []);
  const hasEditPermission =
    hasPermission(role, Permission.TaskEditOthers) ||
    (hasPermission(role, Permission.TaskEdit) && task.createdByUser === userId);
  const tasksPage = `${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.tasks}`;
  const [patchTaskTrigger] = apiV2.usePatchTaskMutation();

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

  const handleEditConfirm = async (newValue: string, fieldId: string) => {
    try {
      await patchTaskTrigger({
        roadmapId: Number(roadmapId),
        task: {
          id: task.id,
          [fieldId]: newValue,
        },
      }).unwrap();
    } catch (err: any) {
      return err.data?.message;
    }
  };

  return (
    <div className="overviewContainer">
      <Overview
        backHref={`${tasksPage}${paths.tasksRelative.tasklist}`}
        overviewType={t('Task')}
        name={task.name}
        previousAndNext={siblingTasks}
        onOverviewChange={(id) => history.push(`${tasksPage}/task/${id}`)}
        onDataEditConfirm={handleEditConfirm}
        key={task.id}
        {...getTaskOverviewData(task, hasEditPermission)}
      />
      <div className={classes(css.section)}>
        <div className={classes(css.header)}>
          <h2>{t('Relations')}</h2>
        </div>
        <div className={classes(css.relations)}>
          <RelationTableRequires task={task} />
          <RelationTableContributes task={task} />
          <RelationTablePrecedes task={task} />
        </div>
      </div>

      <div className={classes(css.section)}>
        <div className={classes(css.header)}>
          <h2>{t('Ratings')}</h2>
          <div className={classes(css.missingRatings)}>
            <MissingRatings task={task} label />
            <TaskModalButtons task={task} overview />
          </div>
        </div>
        <div className={classes(css.ratings)}>
          {valueRatings.length > 0 && (
            <RatingTableValue
              ratings={valueRatings}
              avg={value.avg}
              taskId={task.id}
            />
          )}
          {complexityRatings.length > 0 && (
            <RatingTableComplexity
              ratings={complexityRatings}
              avg={complexity.avg}
              taskId={task.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskOverviewPage = () => {
  const { taskId } = useParams<{ taskId: string | undefined }>();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: tasks, isFetching } = apiV2.useGetTasksQuery(
    roadmapId ?? skipToken,
  );
  const taskIdx = tasks?.findIndex(({ id }) => Number(taskId) === id);
  if (isFetching) return <LoadingSpinner />;
  if (!tasks || taskIdx === undefined || taskIdx < 0)
    return <Redirect to={paths.notFound} />;
  return <TaskOverview tasks={tasks} task={tasks[taskIdx]} taskIdx={taskIdx} />;
};
