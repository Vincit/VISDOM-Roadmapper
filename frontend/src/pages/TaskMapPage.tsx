import { ReactNode, FC, useEffect, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
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
  allTasksSelector,
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

/* eslint-disable */
const isEdge = (x: Edge | Group): x is Edge => x.type === 'custom';
const isGroup = (x: Edge | Group): x is Group => x.type === 'special';
/* eslint-enable */

export const TaskMapPage = () => {
  const { t } = useTranslation();
  const tasks = useSelector(allTasksSelector, shallowEqual);
  const mapPosition = useSelector(taskmapPositionSelector, shallowEqual);
  const dispatch = useDispatch<StoreDispatchType>();
  const [taskRelations, setTaskRelations] = useState(groupTaskRelations(tasks));
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [disableDrag, setDisableDrag] = useState(false);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [flowElements, setFlowElements] = useState<(Edge | Group)[]>([]);
  const [flowInstance, setFlowInstance] = useState<OnLoadParams | undefined>();
  const [unavailable, setUnavailable] = useState<Set<number>>(new Set());
  const [dragHandle, setDragHandle] = useState<TaskProps['dragHandle']>();

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
        const task = tasks.find(({ id }) => id === taskId);
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

    const groups: Group[] = measuredRelations.map(({ id, synergies }) => {
      const node = graph.node(id);
      return {
        id,
        type: 'special',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: false,
        // dagre coordinates are in the center, calculate top left corner
        position: { x: node.x - node.width / 2, y: node.y - node.height / 2 },
        data: {
          label: (
            <TaskGroup
              listId={id}
              taskIds={synergies}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              allDependencies={taskRelations.flatMap(
                ({ dependencies }) => dependencies,
              )}
              disableDragging={disableDrag}
              unavailable={unavailable}
              dragHandle={dragHandle}
            />
          ),
        },
      };
    });

    const edges: Edge[] = measuredRelations.flatMap(({ dependencies }, idx) =>
      dependencies.map(({ from, to }) => {
        const targetGroup = measuredRelations.find(({ synergies }) =>
          synergies.includes(to),
        );

        return {
          id: `from-${from}-to-${to}`,
          source: String(idx),
          sourceHandle: `from-${from}`,
          target: targetGroup!.id,
          targetHandle: `to-${to}`,
          type: 'custom',
          data: { disableInteraction: disableDrag },
        };
      }),
    );

    setFlowElements([...groups, ...edges]);
  }, [
    unavailable,
    disableDrag,
    divRef,
    dragHandle,
    selectedTask,
    taskRelations,
    tasks,
  ]);

  const onConnect = async (data: any) => {
    const { sourceHandle, targetHandle } = data;
    const type = TaskRelationType.Dependency;

    // Handles are in form 'from-{id}' and 'to-{id}', splitting required
    const from = Number(sourceHandle.split('-')[1]);
    const to = Number(targetHandle.split('-')[1]);

    if (
      // the connection would introduce a dependency cycle
      from === to ||
      unavailable.has(from) ||
      unavailable.has(to) ||
      // the relation already exists
      taskRelations.some(({ dependencies }) =>
        dependencies.some(
          (x) =>
            (to === x.from && from === x.to) ||
            (to === x.to && from === x.from),
        ),
      )
    )
      return;

    await dispatch(roadmapsActions.addTaskRelation({ from, to, type }));
    dispatch(roadmapsActions.getRoadmaps());
  };

  const addSynergyRelations = async (from: number, to: number[]) => {
    const ok = await dispatch(
      roadmapsActions.addSynergyRelations({ from, to }),
    ).unwrap();
    if (ok) dispatch(roadmapsActions.getRoadmaps());
    return ok;
  };

  const onDragMoveOutside = async (draggedTaskId: number) => {
    const draggedIndex = taskRelations.findIndex(({ synergies }) =>
      synergies.includes(draggedTaskId),
    );
    if (draggedIndex < 0 || taskRelations[draggedIndex].synergies.length === 1)
      return;
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
    const { source, destination, draggableId } = result;
    const draggedTaskId = Number(draggableId);
    const backupList = copyRelationList(taskRelations);

    try {
      if (!destination) await onDragMoveOutside(draggedTaskId);
      else if (source.droppableId !== destination.droppableId)
        await onDragMoveToGroup(source, destination, draggedTaskId);
    } catch (err) {
      setTaskRelations(backupList);
    } finally {
      setDisableDrag(false);
    }
  };

  return (
    <div className={classes(css['layout-row'], css.grow)}>
      <div
        id="taskmap"
        className={classes(css.taskmap, css.grow)}
        style={{
          ['--zoom' as any]: mapPosition?.zoom || 1,
        }}
      >
        <DragDropContext
          onDragEnd={onDragEnd}
          onDragStart={() => setDisableDrag(true)}
        >
          <ReactFlowProvider>
            <ReactFlow
              className={classes(css.flowContainer)}
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
          <div className={classes(css.taskOverviewContainer)}>
            {selectedTask && (
              <OverviewContent {...getTaskOverviewData(selectedTask, false)} />
            )}
          </div>
        </DragDropContext>
        <div ref={setDivRef} className={classes(css.measureTaskName)} />
      </div>
    </div>
  );
};
