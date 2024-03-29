import { FC, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
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
import { relationTableTitle, relationTables } from '../TaskRelationTable';
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
    const { t } = useTranslation();
    const bad = badRelations.some((relation) => relation[targetKey] === target);
    if (!bad) return null;
    return (
      <InfoTooltip title={t(title)}>
        <AlertIcon />
      </InfoTooltip>
    );
  };
};

const RelationTables = relationTables<{
  badRelations: TaskRelation[];
  onTaskClick?: () => unknown;
  showMilestoneName?: boolean;
}>((type) => {
  const Title = relationTableTitle(type);
  const BadRelationWarning = badRelationWarning(type);
  return ({
    task,
    badRelations,
    height = 500,
    onTaskClick,
    showMilestoneName,
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
        <Title style={{ marginLeft: 0 }} count={tasks.length} />
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
            showMilestoneName,
          }}
          Action={RelationWarning}
        />
      </div>
    );
  };
});

export const RelationsModal: Modal<ModalTypes.RELATIONS_MODAL> = ({
  taskId,
  badRelations,
  closeModal,
}) => {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
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
              <div className={classes(css.taskDetails)}>
                <h3>{task.name}</h3>
                <div>{task.description}</div>
              </div>
              <RelationTables
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
                showMilestoneName={showMilestoneNames}
              />
              <hr style={{ margin: 0 }} />
              <Checkbox
                label={t('Show milestone names in tasks')}
                checked={showMilestoneNames}
                onChange={setShowMilestoneNames}
              />
              <p>
                <Trans
                  // NOTE: the links must be the 2. and 4. child
                  i18nKey="Task relation edit links"
                >
                  Tasks’ relations can be modified in{' '}
                  <Link
                    className="green"
                    to={{
                      pathname: `${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.tasks}/${task.id}`,
                      state: { from: `${pathname}${search}` },
                    }}
                    onClick={() => {
                      closeModal();
                    }}
                  >
                    task details page
                  </Link>
                  {' or through '}
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
                </Trans>
              </p>
            </>
          )}
        </div>
      </ModalContent>
    </div>
  );
};
