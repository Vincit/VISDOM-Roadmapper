import { FC, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { VariableSizeList } from 'react-window';
import CachedIcon from '@mui/icons-material/Cached';
import ClockIcon from '@mui/icons-material/Schedule';
import CheckIcon from '@mui/icons-material/Check';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Info } from './modalparts/Info';
import { RelationIcon } from '../RelationIcon';
import { Task, TaskRelation } from '../../redux/roadmaps/types';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { ReactComponent as AlertIcon } from '../../icons/alert-exclamation-mark.svg';
import { InfoTooltip } from '../InfoTooltip';
import {
  TaskRelationTableType,
  getTaskRelations,
} from '../../utils/TaskRelationUtils';
import { TaskRow } from '../TaskTable';
import { paths } from '../../routers/paths';
import colors from '../../colors.module.scss';
import css from './RelationsModal.module.scss';
import { apiV2, selectById } from '../../api/api';

const classes = classNames.bind(css);

const BadRelationWarning: FC<{
  relation: { to: number; type: TaskRelationTableType };
  badRelations: TaskRelation[];
}> = ({ relation, badRelations }) => {
  const bad = badRelations.some(
    ({ from, to }) =>
      (relation.type === TaskRelationTableType.Requires &&
        from === relation.to) ||
      (relation.type === TaskRelationTableType.Precedes && to === relation.to),
  );
  if (!bad) return null;

  return (
    <InfoTooltip
      title={
        relation.type === TaskRelationTableType.Requires
          ? 'Task is currently placed before this dependency'
          : 'Task is currently not placed before this dependent task'
      }
    >
      <div>
        <AlertIcon style={{ width: 15, height: '100%' }} />
      </div>
    </InfoTooltip>
  );
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
}> = (type) => {
  const Icon = icons[type];
  const title = titles[type];
  const subTitle = subTitles[type];
  return ({ task, badRelations, height = 500, onTaskClick }) => {
    const roadmapId = useSelector(chosenRoadmapIdSelector);
    const { data: relations } = apiV2.useGetTaskRelationsQuery(
      roadmapId ?? skipToken,
    );
    const { data: allTasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
    const listRef = useRef<VariableSizeList<any> | null>(null);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
    const [rowHeights, setRowHeights] = useState<number[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
      if (relations && allTasks) {
        const ids = getTaskRelations(task.id, relations, type);
        setTasks(allTasks.filter(({ id }) => ids.has(id)));
      }
    }, [relations, allTasks, task.id]);

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
        {!tasks.length ? (
          <div className={classes(css.noRelations)}>
            <Trans i18nKey="No relations" />
          </div>
        ) : (
          <VariableSizeList
            ref={listRef}
            itemSize={(idx) => rowHeights[idx] ?? 0}
            itemCount={tasks.length}
            height={Math.min(height, listHeight)}
            width="105%"
          >
            {({ index, style }) => (
              <div style={{ ...style, display: 'flex', alignItems: 'center' }}>
                <TaskRow
                  style={{
                    ['--background-color' as any]: colors.black5,
                    marginLeft: 0,
                  }}
                  task={tasks[index]}
                  largeIcons
                  onClick={onTaskClick}
                />
                <div style={{ width: 20 }}>
                  <BadRelationWarning
                    relation={{ to: tasks[index].id, type }}
                    badRelations={badRelations}
                  />
                </div>
              </div>
            )}
          </VariableSizeList>
        )}
        <div ref={setDivRef} className={classes(css.measureTaskName)} />
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
          {task && (
            <>
              <RelationTableRequires
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
              />
              <RelationTableContributes
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
              />
              <RelationTablePrecedes
                task={task}
                badRelations={badRelations}
                onTaskClick={closeModal}
              />
            </>
          )}
          <p>
            Tasks’ relations can be modified in task details page or through{' '}
            <Link
              // TODO: maybe also link to the current "task details page"
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
        </div>
      </ModalContent>
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button
            className="button-large"
            type="button"
            onClick={() => closeModal()}
          >
            <Trans i18nKey="Ok" />
          </button>
        </ModalFooterButtonDiv>
      </ModalFooter>
    </div>
  );
};
