import { ReactNode, FC, useEffect, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import {
  DragDropContext,
  DropResult,
  DraggableLocation,
} from 'react-beautiful-dnd';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { useTranslation } from 'react-i18next';
import {
  chosenRoadmapIdSelector,
  taskmapPositionSelector,
} from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps';
import { Task } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import {
  groupTaskRelations,
  GroupedRelation,
  getAutolayout,
  reachable,
  blockedGroups,
} from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { CustomEdge } from '../components/TaskMapEdge';
import { ConnectionLine } from '../components/TaskMapConnection';
import { Position, TaskProps } from '../components/TaskMapTask';
import { move, partition } from '../utils/array';
import { TaskGroup } from '../components/TaskMapTaskGroup';
import css from './TaskMapPage.module.scss';
import { InfoTooltip } from '../components/InfoTooltip';
import { apiV2 } from '../api/api';
import { SortableTaskList } from '../components/SortableTaskList';
import { ExpandableColumn } from '../components/ExpandableColumn';

const classes = classNames.bind(css);

const copyRelationList = (list: GroupedRelation[]) =>
  list.map(({ synergies, dependencies }) => ({
    synergies: [...synergies],
    dependencies: [...dependencies],
  })) as GroupedRelation[];

const CustomNodeComponent: FC<{ data: any }> = ({ data }) => {
  return <div>{data.label}</div>;
};

type Group = {
  id: string;
  type: 'special';
  sourcePosition: Position;
  targetPosition: Position;
  draggable: boolean;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: ReactNode;
  };
};

type Edge = {
  id: string;
  type: 'custom';
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  data: {
    disableInteraction: boolean;
  };
};

export const TaskMapPage = () => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const { data: relations } = apiV2.useGetTaskRelationsQuery(
    roadmapId ?? skipToken,
  );
  const [addTaskRelation] = apiV2.useAddTaskRelationMutation();
  const [addSynergy] = apiV2.useAddSynergyRelationsMutation();
  const mapPosition = useSelector(taskmapPositionSelector, shallowEqual);
  const dispatch = useDispatch<StoreDispatchType>();
  const [taskRelations, setTaskRelations] = useState<GroupedRelation[]>([]);
  const [stagedTasks, setStagedTasks] = useState<number[]>([]);
  const [unstagedTasks, setUnstagedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [draggedTask, setDraggedTask] = useState<number | undefined>();
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [flowElements, setFlowElements] = useState<(Edge | Group)[]>([]);
  const [flowInstance, setFlowInstance] = useState<OnLoadParams | undefined>();
  const [unavailable, setUnavailable] = useState<Set<number>>(new Set());
  const [dropUnavailable, setDropUnavailable] = useState<Set<string>>(
    new Set(),
  );
  const [dragHandle, setDragHandle] = useState<TaskProps['dragHandle']>();

  const [expandUnstaged, setExpandUnstaged] = useState(false);

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

  useEffect(() => {
    if (!mapPosition && flowInstance && flowElements.length) {
      // calling flowInstance.fitView() directly doesn't work, this seems to be
      // a limitation of the library
      const instance = flowInstance;
      requestAnimationFrame(() => instance.fitView());
    }
  }, [flowInstance, flowElements, mapPosition]);

  useEffect(() => {
    if (!divRef || taskRelations.length === 0) return;

    const measuredRelations = taskRelations.map((relation, idx) => {
      // calculate taskgroup height
      let height = 40;

      relation.synergies.forEach((taskId) => {
        const task = tasks?.find(({ id }) => id === taskId);
        if (!task) return;
        height += 40;
        // calculate text height
        divRef.textContent = task.name;
        height += divRef.offsetHeight;
        divRef.textContent = '';
      });
      return { id: `${idx}`, width: 436, height, ...relation };
    });

    const graph = getAutolayout(measuredRelations);

    const groups: Group[] = !tasks
      ? []
      : measuredRelations.map(({ id, synergies }) => {
          const node = graph.node(id);
          return {
            id,
            type: 'special',
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            draggable: false,
            // dagre coordinates are in the center, calculate top left corner
            position: {
              x: node.x - node.width / 2,
              y: node.y - node.height / 2,
            },
            data: {
              label: (
                <TaskGroup
                  listId={id}
                  taskIds={synergies}
                  tasks={tasks}
                  selectedTask={selectedTask}
                  setSelectedTask={setSelectedTask}
                  allDependencies={taskRelations.flatMap(
                    ({ dependencies }) => dependencies,
                  )}
                  disableDragging={draggedTask !== undefined}
                  disableDrop={dropUnavailable.has(id)}
                  unavailable={unavailable}
                  dragHandle={dragHandle}
                />
              ),
            },
          };
        });

    const edges: Edge[] = measuredRelations.flatMap(({ dependencies }, idx) =>
      dependencies.flatMap(({ from, to }) => {
        const targetGroup = measuredRelations.find(({ synergies }) =>
          synergies.includes(to),
        );
        if (!targetGroup) return [];
        return [
          {
            id: `from-${from}-to-${to}`,
            source: String(idx),
            sourceHandle: `from-${from}`,
            target: targetGroup.id,
            targetHandle: `to-${to}`,
            type: 'custom',
            data: { disableInteraction: draggedTask !== undefined },
          },
        ];
      }),
    );

    setFlowElements([...groups, ...edges]);
  }, [
    unavailable,
    draggedTask,
    divRef,
    dragHandle,
    selectedTask,
    taskRelations,
    tasks,
    dropUnavailable,
  ]);

  const onConnect = async (data: any) => {
    const { sourceHandle, targetHandle } = data;
    const type = TaskRelationType.Dependency;

    // Handles are in form 'from-{id}' and 'to-{id}', splitting required
    const from = Number(sourceHandle.split('-')[1]);
    const to = Number(targetHandle.split('-')[1]);

    // the handle only accepts valid connections
    await addTaskRelation({
      roadmapId: roadmapId!,
      relation: { from, to, type },
    }).unwrap();
  };

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
    await addSynergyRelations(draggedTaskId, []);
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
      await addSynergyRelations(
        draggedTaskId,
        taskRelations[destinationId].synergies,
      );
      return;
    }

    if (destinationId === -1) {
      // staged task is unstaged
      setStagedTasks((prev) => prev.filter((id) => id !== draggedTaskId));
      await addSynergyRelations(draggedTaskId, []);
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
    await addSynergyRelations(
      draggedTaskId,
      taskRelations[destinationId].synergies,
    );
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, reason } = result;
    const draggedTaskId = Number(draggableId);
    const backupList = copyRelationList(taskRelations);
    setDropUnavailable(new Set());

    try {
      if (reason === 'DROP') {
        if (!destination) await onDragMoveOutside(draggedTaskId);
        else if (source.droppableId !== destination.droppableId)
          await onDragMoveToGroup(source, destination, draggedTaskId);
      }
    } catch (err) {
      setTaskRelations(backupList);
    } finally {
      setDraggedTask(undefined);
    }
  };

  return (
    <div
      id="taskmap"
      className={classes(css.taskmap, css.grow)}
      style={{
        ['--zoom' as any]: mapPosition?.zoom || 1,
      }}
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
            <ReactFlow
              connectionLineComponent={ConnectionLine}
              elements={flowElements}
              nodeTypes={{
                special: CustomNodeComponent,
              }}
              draggable={false}
              onConnectStart={(_, { nodeId, handleId, handleType }) => {
                if (!nodeId || !handleId || !handleType) return;
                const taskId = Number(handleId.split('-')[1]);
                setUnavailable(reachable(taskId, taskRelations, handleType));
                const existingConnections = taskRelations.flatMap(
                  ({ dependencies }) =>
                    dependencies.flatMap(({ from, to }) =>
                      from === taskId || to === taskId ? [from, to] : [],
                    ),
                );
                setDragHandle({
                  type: handleType,
                  from: taskId,
                  existingConnections,
                });
              }}
              onConnectEnd={() => {
                setUnavailable(new Set());
                setDragHandle(undefined);
              }}
              onConnect={onConnect}
              edgeTypes={{
                custom: CustomEdge,
              }}
              onContextMenu={(e) => e.preventDefault()}
              onLoad={setFlowInstance}
              defaultZoom={mapPosition?.zoom}
              defaultPosition={mapPosition && [mapPosition.x, mapPosition.y]}
              onMove={(tr) => {
                if (tr) dispatch(roadmapsActions.setTaskmapPosition(tr));
              }}
            >
              <Controls showInteractive={false} showZoom={false}>
                <InfoTooltip title={t('Taskmap-tooltip')}>
                  <InfoIcon
                    className={classes(css.info, css.tooltipIcon, css.infoIcon)}
                  />
                </InfoTooltip>
              </Controls>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        {selectedTask && (
          <div className={classes(css.taskOverviewContainer)}>
            <OverviewContent {...getTaskOverviewData(selectedTask, false)} />
          </div>
        )}
      </DragDropContext>
      <div ref={setDivRef} className={classes(css.measureTaskName)} />
    </div>
  );
};
