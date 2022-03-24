import { FC, useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Trans } from 'react-i18next';
import { VariableSizeList } from 'react-window';
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
import { TaskRow } from './TaskTable';
import { CloseButton } from './forms/SvgButton';
import css from './TaskRelationTable.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

interface RelationTableDef {
  type: TaskRelationTableType;
  buildRelation: (task: number, other: number) => TaskRelation;
}

type RelationTableProps = {
  task: Task;
  height?: number;
};

const DropdownIndicator = () => <SearchIcon />;

const relationTable: (def: RelationTableDef) => FC<RelationTableProps> = ({
  type,
  buildRelation,
}) => ({ task, height = 500 }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: relations } = apiV2.useGetTaskRelationsQuery(
    roadmapId ?? skipToken,
  );
  const { data: allTasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const [addTaskRelation] = apiV2.useAddTaskRelationMutation();
  const [removeTaskRelation] = apiV2.useRemoveTaskRelationMutation();
  const listRef = useRef<VariableSizeList<any> | null>(null);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [listHeight, setListHeight] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableConnections, setAvailableConnections] = useState<Task[]>([]);

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
        {type === TaskRelationTableType.Requires && <ClockIcon />}
        {type === TaskRelationTableType.Precedes && <CheckIcon />}
        {type === TaskRelationTableType.Contributes && <CachedIcon />}
        <h3>
          <Trans i18nKey={TaskRelationTableType[type]} />
        </h3>
      </div>
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
            addTaskRelation({
              roadmapId,
              relation: buildRelation(task.id, selected.value),
            });
          }
        }}
        options={availableConnections.map(({ id, name }) => ({
          value: id,
          label: name,
        }))}
      />
      <br />
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
          {({ index, style }) => {
            const { id } = tasks[index];
            return (
              <div style={{ ...style, display: 'flex', alignItems: 'center' }}>
                <TaskRow task={tasks[index]} largeIcons />
                <CloseButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (roadmapId) {
                      removeTaskRelation({
                        roadmapId,
                        relation: buildRelation(task.id, id),
                      });
                    }
                  }}
                />
              </div>
            );
          }}
        </VariableSizeList>
      )}
      <div ref={setDivRef} className={classes(css.measureTaskName)} />
    </div>
  );
};

export const RelationTableRequires = relationTable({
  type: TaskRelationTableType.Requires,
  buildRelation: (task, other) => ({
    from: other,
    to: task,
    type: TaskRelationType.Dependency,
  }),
});

export const RelationTablePrecedes = relationTable({
  type: TaskRelationTableType.Precedes,
  buildRelation: (task, other) => ({
    from: task,
    to: other,
    type: TaskRelationType.Dependency,
  }),
});

export const RelationTableContributes = relationTable({
  type: TaskRelationTableType.Contributes,
  buildRelation: (task, other) => ({
    from: task,
    to: other,
    type: TaskRelationType.Synergy,
  }),
});
