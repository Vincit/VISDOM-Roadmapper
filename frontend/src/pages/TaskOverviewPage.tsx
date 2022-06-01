import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
// useTranslation is a hook and thus can't be used in a function
import i18n from 'i18next';
import { useSelector, shallowEqual } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useParams, useHistory, Redirect, useLocation } from 'react-router-dom';
import { Permission, TaskStatus } from '../../../shared/types/customTypes';
import { isToday, isYesterday } from '../../../shared/utils/date';
import {
  valueAndComplexitySummary,
  getRatingsByType,
  taskStatusToText,
} from '../utils/TaskUtils';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { userInfoSelector, userRoleSelector } from '../redux/user/selectors';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { RoadmapUser, Task } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { RatingTableComplexity } from '../components/RatingTableComplexity';
import { RatingTableValue } from '../components/RatingTableValue';
import { RelationTables } from '../components/TaskRelationTable';
import { Overview, ArrowType } from '../components/Overview';
import { hasPermission } from '../../../shared/utils/permission';
import colors from '../colors.module.scss';
import css from './TaskOverviewPage.module.scss';
import { MissingRatings } from '../components/MissingRatings';
import { TaskModalButtons } from '../components/TaskModalButtons';
import { apiV2 } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EditableTextWithButtons } from '../components/EditableText';
import { EditableSelectWithButtons } from '../components/EditableSelect';

const classes = classNames.bind(css);

export const getTaskOverviewData = (
  task: Task,
  users: RoadmapUser[] | undefined,
  onEdit?: (
    newValue: string | TaskStatus,
    fieldId: string,
  ) => Promise<string | void>,
) => {
  const { value, complexity } = valueAndComplexitySummary(task);

  const metrics = [
    {
      label: i18n.t('Avg Value'),
      value: value.avg,
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: i18n.t('Avg Complexity'),
      value: complexity.avg,
      children: <WorkRoundIcon color={colors.black100} />,
    },
  ];

  let editedAtText: string;
  if (!task.updatedAt) {
    editedAtText = '-';
  } else {
    const updatedDate = new Date(task.updatedAt);
    let datePart: string;
    if (isYesterday(updatedDate))
      datePart = i18n.t('Yesterday at <time>', {
        time: updatedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    else if (isToday(updatedDate))
      datePart = i18n.t('Today at <time>', {
        time: updatedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    else
      datePart = i18n.t('On <date>', {
        date: updatedDate.toLocaleDateString(),
      });
    editedAtText = `${
      users?.find((u) => u.id === task.lastUpdatedByUserId)?.email ??
      i18n.t('deleted account')
    } (${datePart})`;
  }

  const data = [
    [
      {
        label: i18n.t('Title'),
        value: task.name,
        format: 'bold',
        ...(onEdit && {
          EditComponent: (
            <EditableTextWithButtons
              onOk={onEdit}
              value={task.name}
              fieldId="name"
              format="bold"
            />
          ),
        }),
      },
      {
        label: i18n.t('Description'),
        value: task.description,
        format: 'multiline',
        ...(onEdit && {
          EditComponent: (
            <EditableTextWithButtons
              onOk={onEdit}
              value={task.description}
              fieldId="description"
              format="multiline"
            />
          ),
        }),
      },
    ],
    [
      {
        label: i18n.t('Created on'),
        value: new Date(task.createdAt).toLocaleDateString(),
        format: 'bold',
      },
      {
        label: i18n.t('Status'),
        value: taskStatusToText(task.status),
        format: TaskStatus[task.status],
        ...(onEdit && {
          EditComponent: (
            <EditableSelectWithButtons
              onOk={onEdit}
              value={{
                value: task.status,
                label: taskStatusToText(task.status),
              }}
              fieldId="status"
              format={TaskStatus[task.status]}
              options={Object.values(TaskStatus)
                .filter(
                  (status): status is number => !Number.isNaN(Number(status)),
                )
                .map((status) => ({
                  value: status,
                  label: taskStatusToText(status),
                }))}
            />
          ),
        }),
      },
    ],
    [
      {
        label: i18n.t('Last modified by'),
        value: editedAtText,
      },
    ],
  ];

  return { metrics, data };
};

interface LocationState {
  from: string | undefined;
}

const TaskOverview: FC<{
  tasks: Task[];
  task: Task;
  taskIdx: number;
}> = ({ tasks, task, taskIdx }) => {
  const history = useHistory();
  const { state } = useLocation<LocationState | undefined>();
  const { t } = useTranslation();
  const role = useSelector(userRoleSelector, shallowEqual);
  const { id: userId } = useSelector(userInfoSelector, shallowEqual)!;
  const roadmapId = useSelector(chosenRoadmapIdSelector);
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
  const { data: users, isLoading } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
  );

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

  const handleEditConfirm = async (
    newValue: string | TaskStatus,
    fieldId: string,
  ) => {
    try {
      await patchTaskTrigger({
        roadmapId: roadmapId!,
        task: {
          id: task.id,
          [fieldId]: newValue,
        },
      }).unwrap();
    } catch (err: any) {
      return err.data?.message ?? 'something went wrong';
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!roadmapId) return null;
  return (
    <div className="overviewContainer">
      <Overview
        backHref={state?.from || `${tasksPage}${paths.tasksRelative.tasklist}`}
        overviewType={t('Task')}
        name={task.name}
        previousAndNext={siblingTasks}
        onOverviewChange={(id) =>
          history.push({
            pathname: `${tasksPage}/${id}`,
            state,
          })
        }
        key={task.id}
        {...getTaskOverviewData(
          task,
          users,
          hasEditPermission ? handleEditConfirm : undefined,
        )}
      />
      <div className={classes(css.section)}>
        <div className={classes(css.header)}>
          <h2>{t('Relations')}</h2>
        </div>
        <div className={classes(css.relations)}>
          <RelationTables task={task} />
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
              task={task}
            />
          )}
          {complexityRatings.length > 0 && (
            <RatingTableComplexity
              ratings={complexityRatings}
              avg={complexity.avg}
              task={task}
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
  const { data: tasks, isLoading } = apiV2.useGetTasksQuery(
    roadmapId ?? skipToken,
  );

  const taskIdx = tasks?.findIndex(({ id }) => Number(taskId) === id);
  if (!roadmapId || isLoading) return <LoadingSpinner />;
  if (!tasks || taskIdx === undefined || taskIdx < 0)
    return <Redirect to={paths.notFound} />;
  return <TaskOverview tasks={tasks} task={tasks[taskIdx]} taskIdx={taskIdx} />;
};
