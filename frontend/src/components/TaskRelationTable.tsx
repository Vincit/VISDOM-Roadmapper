import { FC, useState, useEffect, useCallback, CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Trans } from 'react-i18next';
import Select from 'react-select';
import classNames from 'classnames';
import CachedIcon from '@mui/icons-material/Cached';
import ClockIcon from '@mui/icons-material/Schedule';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { Task, TaskRelation } from '../redux/roadmaps/types';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import {
  TaskRelationTableType,
  getTaskRelations,
  groupTaskRelations,
  reachable,
} from '../utils/TaskRelationUtils';
import { TaskRelationTable } from './TaskTable';
import { CloseButton } from './forms/SvgButton';
import css from './TaskRelationTable.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

const DropdownIndicator = () => <SearchIcon />;

const relationTableTitles = {
  [TaskRelationTableType.Requires]: 'Depends on',
  [TaskRelationTableType.Precedes]: 'Prerequisite for',
  [TaskRelationTableType.Contributes]: 'In synergy with',
} as const;

const subTitles = {
  [TaskRelationTableType.Requires]:
    'Tasks that has to be implemented before this task.',
  [TaskRelationTableType.Precedes]:
    'Tasks that can’t be implemented until this task is completed.',
  [TaskRelationTableType.Contributes]: 'Tasks that are related to this task',
};

const relationTableIcons = {
  [TaskRelationTableType.Requires]: ClockIcon,
  [TaskRelationTableType.Precedes]: CheckIcon,
  [TaskRelationTableType.Contributes]: CachedIcon,
};

export const relationTableTitle = (
  type: TaskRelationTableType,
): FC<{ count?: number; style?: CSSProperties }> => {
  const Icon = relationTableIcons[type];
  const title = relationTableTitles[type];
  const subTitle = subTitles[type];
  const typeClass = css[TaskRelationTableType[type]];
  return ({ count, style }) => (
    <div style={style} className={classes(css.titleContainer)}>
      <div className={classes(css.title, typeClass)}>
        <Icon />
        <h3>
          <Trans i18nKey={title} /> {count !== undefined && `(${count})`}
        </h3>
      </div>
      <p className={classes(css.subTitle)}>
        <Trans i18nKey={subTitle} />
      </p>
    </div>
  );
};

type Table<T> = FC<{ task: Task; height?: number } & T>;

export const relationTables = <T,>(
  builder: (type: TaskRelationTableType) => Table<T>,
): Table<T> => {
  const Requires = builder(TaskRelationTableType.Requires);
  const Contributes = builder(TaskRelationTableType.Contributes);
  const Precedes = builder(TaskRelationTableType.Precedes);

  return ({ ...props }) => (
    <>
      <Requires {...props} />
      <Contributes {...props} />
      <Precedes {...props} />
    </>
  );
};

export const RelationTables = relationTables((type) => {
  // not used with TaskRelationTableType.Contributes
  const buildRelation: (task: number, other: number) => TaskRelation =
    type === TaskRelationTableType.Requires
      ? (to, from) => ({ from, to, type: TaskRelationType.Dependency })
      : (from, to) => ({ from, to, type: TaskRelationType.Dependency });

  const Title = relationTableTitle(type);

  return ({ task, height = 500 }) => {
    const roadmapId = useSelector(chosenRoadmapIdSelector);
    const { data: relations } = apiV2.useGetTaskRelationsQuery(
      roadmapId ?? skipToken,
    );
    const { data: allTasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
    const [addTaskRelation] = apiV2.useAddTaskRelationMutation();
    const [addSynergies] = apiV2.useAddSynergyRelationsMutation();
    const [removeTaskRelation] = apiV2.useRemoveTaskRelationMutation();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [availableConnections, setAvailableConnections] = useState<Task[]>(
      [],
    );

    useEffect(() => {
      if (relations && allTasks) {
        const ids = getTaskRelations(task.id, relations, type);
        setTasks(allTasks.filter(({ id }) => ids.has(id)));
      }
    }, [relations, allTasks, task.id]);

    useEffect(() => {
      if (relations && allTasks) {
        const groups = groupTaskRelations(relations);
        const ids = new Set(tasks.map(({ id }) => id));
        ids.add(task.id);
        if (type !== TaskRelationTableType.Requires)
          reachable(task.id, groups, 'source').forEach((id) => ids.add(id));
        if (type !== TaskRelationTableType.Precedes)
          reachable(task.id, groups, 'target').forEach((id) => ids.add(id));
        setAvailableConnections(allTasks.filter(({ id }) => !ids.has(id)));
      }
    }, [relations, allTasks, tasks, task.id]);

    const RemoveRelation = useCallback(
      ({ task: { id } }: { task: Task }) => (
        <CloseButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (roadmapId) {
              if (type === TaskRelationTableType.Contributes) {
                addSynergies({ roadmapId, from: id, to: [] });
              } else {
                removeTaskRelation({
                  roadmapId,
                  relation: buildRelation(task.id, id),
                });
              }
            }
          }}
        />
      ),
      [roadmapId, task, removeTaskRelation, addSynergies],
    );

    return (
      <div className={classes(css.listContainer)}>
        <Title />
        <Select
          components={{ DropdownIndicator }}
          name="relation"
          id="new-relation"
          classNamePrefix="react-select-relation"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          placeholder="Add relation"
          isDisabled={availableConnections.length === 0}
          value={null}
          escapeClearsValue
          onChange={(selected) => {
            if (selected && roadmapId) {
              if (type === TaskRelationTableType.Contributes) {
                addSynergies({
                  roadmapId,
                  from: selected.value,
                  to: [task.id, ...tasks.map(({ id }) => id)],
                });
              } else {
                addTaskRelation({
                  roadmapId,
                  relation: buildRelation(task.id, selected.value),
                });
              }
            }
          }}
          options={availableConnections.map(({ id, name }) => ({
            value: id,
            label: name,
          }))}
        />
        <br />
        <TaskRelationTable
          height={height}
          tasks={tasks}
          taskProps={{ largeIcons: true }}
          Action={RemoveRelation}
        />
      </div>
    );
  };
});
