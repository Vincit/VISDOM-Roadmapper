import { FC, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import CachedIcon from '@mui/icons-material/Cached';
import ClockIcon from '@mui/icons-material/Schedule';
import CheckIcon from '@mui/icons-material/Check';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalHeader } from './modalparts/ModalHeader';
import { Info } from './modalparts/Info';
import { Checkbox } from '../forms/Checkbox';
import { RelationIcon } from '../RelationIcon';
import { Task, TaskRelation } from '../../redux/roadmaps/types';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { ReactComponent as AlertIcon } from '../../icons/alert-exclamation-mark.svg';
import { InfoTooltip } from '../InfoTooltip';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  TaskRelationTableType,
  getTaskRelations,
} from '../../utils/TaskRelationUtils';
import { TaskRelationTable } from '../TaskTable';
import { paths } from '../../routers/paths';
import colors from '../../colors.module.scss';
import css from './RelationsModal.module.scss';
import { apiV2, selectById } from '../../api/api';

const classes = classNames.bind(css);

const badRelationWarning = (
  type: TaskRelationTableType,
): FC<{ target: number; badRelations: TaskRelation[] }> => {
  const title =
    type === TaskRelationTableType.Requires
      ? 'Task is currently placed before this dependency'
      : 'Task is currently not placed before this dependent task';

  // Synergy can't be bad at the moment.
  if (type === TaskRelationTableType.Contributes) return () => null;

  const targetKey = type === TaskRelationTableType.Requires ? 'from' : 'to';
  return ({ target, badRelations }) => {
    const bad = badRelations.some((relation) => relation[targetKey] === target);
    if (!bad) return null;
    return (
      <InfoTooltip title={title}>
        <AlertIcon />
      </InfoTooltip>
    );
  };
};

const icons = {
  [TaskRelationTableType.Requires]: ClockIcon,
  [TaskRelationTableType.Precedes]: CheckIcon,
  [TaskRelationTableType.Contributes]: CachedIcon,
};

// TODO: translations
// NOTE: should the titles be same as in task overview?
const titles = {
  [TaskRelationTableType.Requires]: 'Depends on',
  [TaskRelationTableType.Precedes]: 'Prerequisite for',
  [TaskRelationTableType.Contributes]: 'In synergy with',
};

const subTitles = {
  [TaskRelationTableType.Requires]:
    'Tasks that has to be implemented before this task.',
  [TaskRelationTableType.Precedes]:
    'Tasks that can’t be implemented until this task is completed.',
  [TaskRelationTableType.Contributes]: 'Tasks that are related to this task',
};

// TODO: some sharing with TaskRelationTable
const relationTable: (
  type: TaskRelationTableType,
) => FC<{
  task: Task;
  badRelations: TaskRelation[];
  height?: number;
  onTaskClick?: () => unknown;
  showMilestoneNames?: boolean;
}> = (type) => {
  const Icon = icons[type];
  const title = titles[type];
  const subTitle = subTitles[type];
  const BadRelationWarning = badRelationWarning(type);
  return ({
    task,
    badRelations,
    height = 500,
    onTaskClick,
    showMilestoneNames,
  }) => {
    const roadmapId = useSelector(chosenRoadmapIdSelector);
    const { data: relations } = apiV2.useGetTaskRelationsQuery(
      roadmapId ?? skipToken,
    );
    const { data: allTasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
      if (relations && allTasks) {
        const ids = getTaskRelations(task.id, relations, type);
        setTasks(allTasks.filter(({ id }) => ids.has(id)));
      }
    }, [relations, allTasks, task.id]);

    const RelationWarning = useCallback(
      ({ task: { id } }: { task: Task }) => (
        <div className={classes(css.relationAlert)}>
          <BadRelationWarning target={id} badRelations={badRelations} />
        </div>
      ),
      [badRelations],
    );

    return (
      <div className={classes(css.listContainer)}>
        <div
          className={classes(
            css.titleContainer,
            css[TaskRelationTableType[type]],
          )}
        >
          <Icon />
          <h3>
            <Trans i18nKey={title} /> ({tasks.length ?? 0})
          </h3>
        </div>
        <p className={classes(css.subTitle)}>{subTitle}</p>
        <TaskRelationTable
          height={height}
          tasks={tasks}
          taskProps={{
            style: {
              ['--background-color' as any]: colors.black5,
              marginLeft: 0,
            },
            largeIcons: true,
            onClick: onTaskClick,
            showMilestoneName: showMilestoneNames,
          }}
          Action={RelationWarning}
        />
      </div>
    );
  };
};

const RelationTableRequires = relationTable(TaskRelationTableType.Requires);
const RelationTablePrecedes = relationTable(TaskRelationTableType.Precedes);
const RelationTableContributes = relationTable(
  TaskRelationTableType.Contributes,
);

export const RelationsModal: Modal<ModalTypes.RELATIONS_MODAL> = ({
  taskId,
  badRelations,
  closeModal,
}) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: task } = apiV2.useGetTasksQuery(
    roadmapId ?? skipToken,
    selectById(taskId),
  );
  const [openInfo, setOpenInfo] = useState(true);
  const [showMilestoneNames, setShowMilestoneNames] = useState(false);

  return (
    <div>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <RelationIcon type={TaskRelationTableType.Contributes} size={20} />{' '}
          <Trans i18nKey="Task relations" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.content)}>
          <Info open={openInfo} onChange={setOpenInfo}>
            <Trans i18nKey="Taskrelation info" />
          </Info>
          {!task ? (
            <LoadingSpinner />
          ) : (
            <>
              <RelationTableRequires
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
                showMilestoneNames={showMilestoneNames}
              />
              <RelationTableContributes
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
                showMilestoneNames={showMilestoneNames}
              />
              <RelationTablePrecedes
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
                showMilestoneNames={showMilestoneNames}
              />
              <hr style={{ margin: 0 }} />
              <Checkbox
                label="Show milestone names in tasks"
                checked={showMilestoneNames}
                onChange={setShowMilestoneNames}
              />
              <p>
                Tasks’ relations can be modified in{' '}
                <Link
                  className="green"
                  to={`${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.tasks}/${task.id}`}
                  onClick={() => {
                    closeModal();
                  }}
                >
                  task details page
                </Link>{' '}
                or through{' '}
                <Link
                  className="green"
                  to={`${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.tasks}${paths.tasksRelative.taskmap}`}
                  onClick={() => {
                    closeModal();
                  }}
                >
                  task map
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </ModalContent>
    </div>
  );
};
