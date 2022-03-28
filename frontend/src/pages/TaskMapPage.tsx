import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { ReactFlowProvider } from 'react-flow-renderer';
import {
  DragDropContext,
  DropResult,
  DraggableLocation,
} from 'react-beautiful-dnd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import {
  groupTaskRelations,
  GroupedRelation,
  blockedGroups,
} from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { move, partition } from '../utils/array';
import { apiV2 } from '../api/api';
import { SortableTaskList } from '../components/SortableTaskList';
import { ExpandableColumn } from '../components/ExpandableColumn';
import { TaskMap } from '../components/TaskMap';
import css from './TaskMapPage.module.scss';

const classes = classNames.bind(css);

const copyRelationList = (list: GroupedRelation[]) =>
  list.map(({ synergies, dependencies }) => ({
    synergies: [...synergies],
    dependencies: [...dependencies],
  })) as GroupedRelation[];

export const TaskMapPage = () => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const { data: relations } = apiV2.useGetTaskRelationsQuery(
    roadmapId ?? skipToken,
  );
  const [addSynergy] = apiV2.useAddSynergyRelationsMutation();
  const [taskRelations, setTaskRelations] = useState<GroupedRelation[]>([]);
  const [stagedTasks, setStagedTasks] = useState<number[]>([]);
  const [unstagedTasks, setUnstagedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [draggedTask, setDraggedTask] = useState<number | undefined>();
  const [dropUnavailable, setDropUnavailable] = useState<Set<string>>(
    new Set(),
  );
  const [expandUnstaged, setExpandUnstaged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (relations === undefined) return;
    const ids = relations.flatMap(({ from, to }) => [from, to]);
    setStagedTasks((prev) => Array.from(new Set(ids.concat(prev))));
  }, [relations]);

  useEffect(() => {
    setUnstagedTasks(
      tasks?.filter(({ id }) => !stagedTasks.includes(id)) ?? [],
    );
  }, [tasks, stagedTasks]);

  useEffect(() => {
    if (relations === undefined || tasks === undefined) return;
    const groups = groupTaskRelations(relations);
    const ids = new Set(relations.flatMap(({ from, to }) => [from, to]));
    const staged = stagedTasks.filter((id) => !ids.has(id));
    setTaskRelations(
      groups.concat(
        staged.map((id) => ({
          synergies: [id],
          dependencies: [],
        })),
      ),
    );
  }, [relations, tasks, stagedTasks]);

  const addSynergyRelations = (from: number, to: number[]) =>
    addSynergy({ roadmapId: roadmapId!, from, to }).unwrap();

  const onDragMoveOutside = async (draggedTaskId: number) => {
    const draggedIndex = taskRelations.findIndex(({ synergies }) =>
      synergies.includes(draggedTaskId),
    );
    if (draggedIndex < 0) {
      // staging a task with no relations
      setStagedTasks((prev) => [...prev, draggedTaskId]);
      return;
    }
    if (taskRelations[draggedIndex].synergies.length === 1) return;
    const newList = copyRelationList(taskRelations);
    // remove dragged task from synergy list
    newList[draggedIndex].synergies = newList[draggedIndex].synergies.filter(
      (num) => num !== draggedTaskId,
    );
    const [moved, remaining] = partition(
      newList[draggedIndex].dependencies,
      ({ from, to }) => from === draggedTaskId || to === draggedTaskId,
    );
    newList[draggedIndex].dependencies = remaining;
    newList.push({ synergies: [draggedTaskId], dependencies: moved });

    setTaskRelations(newList);
    setIsLoading(true);
    await addSynergyRelations(draggedTaskId, []);
    setIsLoading(false);
  };

  const onDragMoveToGroup = async (
    source: DraggableLocation,
    destination: DraggableLocation,
    draggedTaskId: number,
  ) => {
    const destinationId = Number(destination.droppableId);
    const sourceId = Number(source.droppableId);

    if (sourceId === -1) {
      // unstaged task added to existing group
      setStagedTasks((prev) => [...prev, draggedTaskId]);
      setUnstagedTasks((prev) => prev.filter(({ id }) => id !== draggedTaskId));
      setTaskRelations((prev) => [
        ...prev,
        { synergies: [draggedTaskId], dependencies: [] },
      ]);
      setIsLoading(true);
      await addSynergyRelations(
        draggedTaskId,
        taskRelations[destinationId].synergies,
      );
      setIsLoading(false);
      return;
    }

    if (destinationId === -1) {
      // staged task is unstaged
      setStagedTasks((prev) => prev.filter((id) => id !== draggedTaskId));
      setIsLoading(true);
      await addSynergyRelations(draggedTaskId, []);
      setIsLoading(false);
      return;
    }

    const copyList = copyRelationList(taskRelations);

    move()
      .from(copyList[sourceId].synergies, source.index)
      .to(copyList[destinationId].synergies, destination.index);

    const [moved, remaining] = partition(
      copyList[sourceId].dependencies,
      ({ from, to }) => from === draggedTaskId || to === draggedTaskId,
    );

    copyList[sourceId].dependencies = remaining;
    copyList[destinationId].dependencies.push(...moved);
    setTaskRelations(copyList);
    setIsLoading(true);
    await addSynergyRelations(
      draggedTaskId,
      taskRelations[destinationId].synergies,
    );
    setIsLoading(false);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, reason } = result;
    const draggedTaskId = Number(draggableId);
    const backupList = copyRelationList(taskRelations);
    setDropUnavailable(new Set());

    try {
      setIsLoading(true);
      if (reason === 'DROP') {
        if (!destination) await onDragMoveOutside(draggedTaskId);
        else if (source.droppableId !== destination.droppableId)
          await onDragMoveToGroup(source, destination, draggedTaskId);
      }
    } catch (err) {
      setTaskRelations(backupList);
    } finally {
      setDraggedTask(undefined);
      setIsLoading(false);
    }
  };

  return (
    <div
      id="taskmap"
      className={classes(css.taskmap, css.grow, { [css.loading]: isLoading })}
    >
      <DragDropContext
        onDragEnd={onDragEnd}
        onDragStart={({ draggableId }) => {
          const id = Number(draggableId);
          setDropUnavailable(blockedGroups(id, taskRelations));
          setDraggedTask(id);
        }}
      >
        <div className={classes(css.flowContainer)}>
          <ExpandableColumn
            expanded={expandUnstaged}
            className={classes({
              [css.loading]: isLoading,
            })}
            onToggle={() => setExpandUnstaged((prev) => !prev)}
            title={
              <div>
                {t('Unstaged tasks')} ({unstagedTasks.length})
              </div>
            }
          >
            <SortableTaskList
              listId="-1"
              tasks={unstagedTasks}
              disableDragging={draggedTask !== undefined}
              isDropDisabled={
                draggedTask !== undefined &&
                relations?.some(
                  ({ from, to, type }) =>
                    (from === draggedTask || to === draggedTask) &&
                    type === TaskRelationType.Dependency,
                )
              }
              showRatings
              showSearch
            />
          </ExpandableColumn>
          <ReactFlowProvider>
            <TaskMap
              taskRelations={taskRelations}
              draggedTask={draggedTask}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              dropUnavailable={dropUnavailable}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </ReactFlowProvider>
        </div>
        {selectedTask && (
          <div className={classes(css.taskOverviewContainer)}>
            <OverviewContent {...getTaskOverviewData(selectedTask, false)} />
          </div>
        )}
      </DragDropContext>
    </div>
  );
};
