import {
  ReactNode,
  FC,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import ReactFlow, {
  applyNodeChanges,
  Controls,
  Position,
  ReactFlowInstance,
} from 'react-flow-renderer';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  chosenRoadmapIdSelector,
  taskmapPositionSelector,
} from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps';
import { Task } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import {
  GroupedRelation,
  getAutolayout,
  reachable,
} from '../utils/TaskRelationUtils';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { CustomEdge } from './TaskMapEdge';
import { ConnectionLine } from './TaskMapConnection';
import { TaskProps } from './TaskMapTask';
import { TaskGroup } from './TaskMapTaskGroup';
import { InfoTooltip } from './InfoTooltip';
import { apiV2 } from '../api/api';

import css from './TaskMap.module.scss';

const classes = classNames.bind(css);

const CustomNodeComponent: FC<{ data: any }> = ({ data }) => {
  return <div>{data.label}</div>;
};

type Group = {
  id: string;
  type: 'special';
  sourcePosition: Position;
  targetPosition: Position;
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
    isLoading: boolean;
    setIsLoading: (_: boolean) => void;
  };
};

export const TaskMap: FC<{
  taskRelations: GroupedRelation[];
  draggedTask: number | undefined;
  selectedTask: Task | undefined;
  setSelectedTask: (task: Task | undefined) => void;
  dropUnavailable: Set<string>;
  isLoading: boolean;
  setIsLoading: any;
}> = ({
  taskRelations,
  draggedTask,
  selectedTask,
  setSelectedTask,
  dropUnavailable,
  isLoading,
  setIsLoading,
}) => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const flowKey = `taskmap-positions-key-rm-${roadmapId}`;
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const [addTaskRelation] = apiV2.useAddTaskRelationMutation();
  const dispatch = useDispatch<StoreDispatchType>();
  const mapPosition = useSelector(taskmapPositionSelector, shallowEqual);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [groups, setGroups] = useState<Group[] | any>([]);
  const [flowInstance, setFlowInstance] = useState<
    ReactFlowInstance | undefined
  >();
  const [unavailable, setUnavailable] = useState<Set<number>>(new Set());
  const [dragHandle, setDragHandle] = useState<TaskProps['dragHandle']>();
  const [groupDraggable, setGroupDraggable] = useState(true);

  useEffect(() => {
    if (!mapPosition && flowInstance && (edges.length || groups.length)) {
      // calling flowInstance.fitView() directly doesn't work, this seems to be
      // a limitation of the library
      const instance = flowInstance;
      requestAnimationFrame(() => instance.fitView());
    }
  }, [flowInstance, mapPosition, edges, groups]);

  const drawCanvas = useCallback(() => {
    if (!divRef) return;
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

    const storageFlow = localStorage.getItem(flowKey);
    const flow = storageFlow ? JSON.parse(storageFlow) : undefined;
    const graph = getAutolayout(measuredRelations);
    const createdGroups: Group[] = !tasks
      ? []
      : measuredRelations.map(({ id, synergies }) => {
          const node = graph.node(id);
          let x = node.x - node.width / 2;
          let y = node.y - node.height / 2;

          if (flow) {
            const correctNode = flow.find(
              (n: any) =>
                JSON.stringify(n.tasks.sort()) ===
                JSON.stringify(synergies.sort()),
            );

            if (correctNode) {
              x = correctNode.position.x;
              y = correctNode.position.y;
            }
          }
          return {
            id,
            type: 'special',
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            // dagre coordinates are in the center, calculate top left corner
            position: { x, y },
            data: {
              label: (
                <TaskGroup
                  listId={id}
                  taskIds={synergies.sort((a, b) => a - b)} // FIXME: ordering prevents render bugs
                  tasks={tasks}
                  selectedTask={selectedTask}
                  setSelectedTask={setSelectedTask}
                  allDependencies={taskRelations.flatMap(
                    ({ dependencies }) => dependencies,
                  )}
                  disableDragging={draggedTask !== undefined || isLoading}
                  draggingSomething={draggedTask !== undefined}
                  disableDrop={dropUnavailable.has(id)}
                  unavailable={unavailable}
                  dragHandle={dragHandle}
                  setGroupDraggable={setGroupDraggable}
                  isLoading={isLoading}
                  nodeHeight={node.height}
                />
              ),
            },
          };
        });

    const createEdges: Edge[] = measuredRelations.flatMap(
      ({ dependencies }, idx) =>
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
              data: {
                disableInteraction: draggedTask !== undefined,
                isLoading,
                setIsLoading,
              },
            },
          ];
        }),
    );

    setGroups(createdGroups);
    setEdges(createEdges);
  }, [
    divRef,
    dragHandle,
    draggedTask,
    dropUnavailable,
    flowKey,
    isLoading,
    selectedTask,
    setIsLoading,
    setSelectedTask,
    taskRelations,
    tasks,
    unavailable,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [
    unavailable,
    draggedTask,
    divRef,
    dragHandle,
    selectedTask,
    setSelectedTask,
    taskRelations,
    tasks,
    dropUnavailable,
    isLoading,
    setIsLoading,
    flowKey,
    drawCanvas,
  ]);

  const saveNodeState = useCallback(() => {
    if (flowInstance) {
      const flow = flowInstance.toObject();
      const filteredFlow = flow.nodes.map((node) => {
        return {
          tasks: node.data.label.props.taskIds,
          position: node.position,
        };
      });

      localStorage.setItem(flowKey, JSON.stringify(filteredFlow));
    }
  }, [flowInstance, flowKey]);

  const onConnect = async (data: any) => {
    if (isLoading) return;
    const { sourceHandle, targetHandle } = data;
    const type = TaskRelationType.Dependency;

    // Handles are in form 'from-{id}' and 'to-{id}', splitting required
    const from = Number(sourceHandle.split('-')[1]);
    const to = Number(targetHandle.split('-')[1]);
    if (from === to) return;

    // the handle only accepts valid connections
    setIsLoading(true);
    await addTaskRelation({
      roadmapId: roadmapId!,
      relation: { from, to, type },
    });
    saveNodeState();
    setIsLoading(false);
  };

  const onNodesChange = useCallback(
    (changes) => {
      if (changes[0].type === 'remove') return;
      setGroups((nodes: Group[]) => applyNodeChanges(changes, nodes));
    },
    [setGroups],
  );

  const onNodesDragStop = useCallback(() => {
    saveNodeState();
  }, [saveNodeState]);

  const resetCanvas = () => {
    localStorage.removeItem(flowKey);
    drawCanvas();
  };

  const nodeTypes = useMemo(() => ({ special: CustomNodeComponent }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  return (
    <div
      className={classes(css.taskMap)}
      style={{
        ['--zoom' as any]: mapPosition?.zoom || 1,
      }}
    >
      <ReactFlow
        connectionLineComponent={ConnectionLine}
        nodesDraggable={groupDraggable}
        nodes={groups}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodesDragStop}
        nodeTypes={nodeTypes}
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
        edgeTypes={edgeTypes}
        onContextMenu={(e) => e.preventDefault()}
        onInit={setFlowInstance}
        defaultZoom={mapPosition?.zoom}
        defaultPosition={mapPosition && [mapPosition.x, mapPosition.y]}
        onMove={(_, viewport) => {
          if (viewport) dispatch(roadmapsActions.setTaskmapPosition(viewport));
        }}
      >
        <Controls showInteractive={false} showZoom={false}>
          <InfoTooltip title={t('Taskmap-tooltip')}>
            <InfoIcon
              className={classes(css.info, css.tooltipIcon, css.infoIcon)}
            />
          </InfoTooltip>
          <RestartAltIcon
            className={classes(css.restart)}
            onClick={resetCanvas}
          />
        </Controls>
      </ReactFlow>
      <div ref={setDivRef} className={classes(css.measureTaskName)} />
    </div>
  );
};
