import { ReactNode, FC, useEffect, useState, useCallback } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import ReactFlow, {
  applyNodeChanges,
  Controls,
  Position,
  ReactFlowInstance,
  Node,
  Edge as FlowEdge,
} from 'react-flow-renderer';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { useTranslation } from 'react-i18next';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  chosenRoadmapIdSelector,
  taskmapPositionSelector,
} from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps';
import { StoreDispatchType } from '../redux';
import {
  GroupedRelation,
  getAutolayout,
  reachable,
} from '../utils/TaskRelationUtils';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { CustomEdge, CustomEdgeData } from './TaskMapEdge';
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

type Group = Node<{ label: ReactNode }> & { type: 'special' };
type Edge = FlowEdge<CustomEdgeData> & { type: 'custom' };

const nodeTypes = { special: CustomNodeComponent };
const edgeTypes = { custom: CustomEdge };

export const TaskMap: FC<{
  taskRelations: GroupedRelation[];
  draggedTask: number | undefined;
  selectedId: number | undefined;
  setSelectedId: (id: number | undefined) => void;
  dropUnavailable: Set<string>;
  isLoading: boolean;
  setIsLoading: (_: boolean) => void;
}> = ({
  taskRelations,
  draggedTask,
  selectedId,
  setSelectedId,
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
  const [edges, setEdges] = useState<Edge[]>([]);
  const [groups, setGroups] = useState<Node<Group['data']>[]>([]);
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
    const measuredRelations = taskRelations.map((relation, idx) => ({
      id: `${idx}`,
      width: 436,
      // group padding + (task margin + task height) * task amount
      height: 20 + (20 + 52) * relation.synergies.length,
      ...relation,
    }));

    const storageFlow = localStorage.getItem(flowKey);
    const flow = storageFlow ? JSON.parse(storageFlow) : undefined;
    const graph = getAutolayout(measuredRelations);
    const createdGroups: Group[] = !tasks
      ? []
      : measuredRelations.map(({ id, synergies }) => {
          const node = graph.node(id);
          // dagre coordinates are in the center, calculate top left corner
          let x = node.x - node.width / 2;
          let y = node.y - node.height / 2;

          if (flow) {
            const key = JSON.stringify(synergies.sort());
            const correctNode = flow.find(
              (n: any) => JSON.stringify(n.tasks.sort()) === key,
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
            position: { x, y },
            data: {
              label: (
                <TaskGroup
                  listId={id}
                  taskIds={synergies.sort((a, b) => a - b)} // FIXME: ordering prevents render bugs
                  tasks={tasks}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
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

    const createdEdges: Edge[] = measuredRelations.flatMap(
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
    setEdges(createdEdges);
  }, [
    dragHandle,
    draggedTask,
    dropUnavailable,
    flowKey,
    isLoading,
    selectedId,
    setIsLoading,
    setSelectedId,
    taskRelations,
    tasks,
    unavailable,
  ]);

  useEffect(() => drawCanvas(), [drawCanvas]);

  const saveNodeState = useCallback(() => {
    if (!flowInstance) return;
    const { nodes } = flowInstance.toObject();
    const filteredFlow = nodes.map(({ data, position }) => ({
      tasks: data.label.props.taskIds,
      position,
    }));
    localStorage.setItem(flowKey, JSON.stringify(filteredFlow));
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

  const resetCanvas = () => {
    localStorage.removeItem(flowKey);
    drawCanvas();
  };

  return (
    <div
      className={classes(css.taskMap)}
      style={{
        ['--zoom' as any]: mapPosition?.zoom || 1,
      }}
      id="taskmap"
    >
      <ReactFlow
        connectionLineComponent={ConnectionLine}
        nodesDraggable={groupDraggable}
        nodes={groups}
        edges={edges}
        onNodesChange={(changes) => {
          if (changes[0].type === 'remove') return;
          setGroups((nodes) => applyNodeChanges(changes, nodes));
        }}
        onNodeDragStop={saveNodeState}
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
          dispatch(roadmapsActions.setTaskmapPosition(viewport));
        }}
      >
        <div className={classes(css.controlsContainer)}>
          <Controls
            className={classes(css.controls)}
            showInteractive={false}
            showZoom={false}
            showFitView={false}
          >
            <InfoTooltip title={t('Fit view -tooltip')}>
              <FullscreenIcon
                className={classes(css.controlButton)}
                onClick={() => {
                  if (flowInstance) flowInstance.fitView();
                }}
              />
            </InfoTooltip>
            <InfoTooltip title={t('Taskgroup reset -tooltip')}>
              <RestartAltIcon
                className={classes(css.controlButton)}
                onClick={resetCanvas}
              />
            </InfoTooltip>
            <InfoTooltip title={t('Taskmap-tooltip')}>
              <InfoIcon
                className={classes(
                  css.taskmapInfo,
                  css.tooltipIcon,
                  css.infoIcon,
                )}
              />
            </InfoTooltip>
          </Controls>
        </div>
      </ReactFlow>
    </div>
  );
};
