import { FC, useEffect, useState } from 'react';
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
} from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { CustomEdge } from '../components/TaskMapEdge';
import { ConnectionLine } from '../components/TaskMapConnection';
import { Position } from '../components/TaskMapTask';
import { move } from '../utils/array';
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

export const TaskMapPage = () => {
  const { t } = useTranslation();
  const tasks = useSelector(allTasksSelector, shallowEqual);
  const mapPosition = useSelector(taskmapPositionSelector, shallowEqual);
  const dispatch = useDispatch<StoreDispatchType>();
  const [taskRelations, setTaskRelations] = useState(groupTaskRelations(tasks));
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [disableDrag, setDisableDrag] = useState(false);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [flowElements, setFlowElements] = useState<any>([]);
  const [flowInstance, setFlowInstance] = useState<OnLoadParams | undefined>();

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

    const groups = measuredRelations.map(({ id, synergies }) => {
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
            />
          ),
        },
      };
    });

    const edges = measuredRelations.flatMap(({ dependencies }, idx) =>
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
  }, [disableDrag, divRef, selectedTask, taskRelations, tasks]);

  const onConnect = async (data: any) => {
    const { sourceHandle, targetHandle } = data;
    const type = TaskRelationType.Dependency;

    // Handles are in form 'from-{id}' and 'to-{id}', splitting required
    const from = Number(sourceHandle.split('-')[1]);
    const to = Number(targetHandle.split('-')[1]);

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
    const newList = taskRelations
      // remove dragged task from synergy list and
      // all dependencies associated with the dragged task
      .map(({ synergies, dependencies }) => ({
        synergies: synergies.filter((num) => num !== draggedTaskId),
        dependencies: dependencies.filter(
          ({ from, to }) => from !== draggedTaskId && to !== draggedTaskId,
        ),
      }))
      // remove entries where synergy list is empty
      .filter(({ synergies }) => synergies.length);
    newList.push({ synergies: [draggedTaskId], dependencies: [] });

    setTaskRelations(newList);
    await addSynergyRelations(draggedTaskId, []);
  };

  const onDragMoveToGroup = async (
    source: DraggableLocation,
    destination: DraggableLocation,
    draggedTaskId: number,
  ) => {
    const destinationId = Number(destination.droppableId);
    const copyList = copyRelationList(taskRelations);

    move()
      .from(copyList[Number(source.droppableId)].synergies, source.index)
      .to(copyList[destinationId].synergies, destination.index);

    const newList = copyList
      // remove entries where synergy list is empty
      .filter(({ synergies }) => synergies.length)
      // remove all dependencies associated with the dragged task
      .map(({ synergies, dependencies }) => ({
        synergies,
        dependencies: dependencies.filter(
          ({ from, to }) => from !== draggedTaskId && to !== draggedTaskId,
        ),
      }));

    setTaskRelations(newList);
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
    <>
      <div
        id="taskmap"
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
      </div>
      <div ref={setDivRef} className={classes(css.measureTaskName)} />
    </>
  );
};
