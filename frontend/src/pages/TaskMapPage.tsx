import { FC, useEffect, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import ReactFlow, { Controls, useStoreState } from 'react-flow-renderer';
import {
  DragDropContext,
  Droppable,
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
} from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { CustomEdge } from '../components/TaskMapEdge';
import { ConnectionLine } from '../components/TaskMapConnection';
import { DraggableSingleTask, Position } from '../components/TaskMapTask';
import { move } from '../utils/array';
import css from './TaskMapPage.module.scss';
import { InfoTooltip } from '../components/InfoTooltip';

const classes = classNames.bind(css);

const copyRelationList = (list: GroupedRelation[]) =>
  list.map(({ synergies, dependencies }) => ({
    synergies: [...synergies],
    dependencies: [...dependencies],
  })) as GroupedRelation[];

const TaskComponent: FC<{
  listId: number;
  taskIds: number[];
  selectedTask: Task | undefined;
  setSelectedTask: any;
  allDependencies: { from: number; to: number }[];
  disableDragging: boolean;
}> = ({
  listId,
  taskIds,
  selectedTask,
  setSelectedTask,
  allDependencies,
  disableDragging,
}) => (
  <Droppable droppableId={String(listId)} type="TASKS">
    {(provided, snapshot) => (
      <div
        className={classes(css.taskContainer, {
          [css.highlight]: snapshot.isDraggingOver,
          [css.loading]: disableDragging,
        })}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {taskIds.map((taskId, index) => {
          return (
            <div key={taskId}>
              <DraggableSingleTask
                taskId={taskId}
                selected={selectedTask?.id === taskId}
                setSelectedTask={setSelectedTask}
                index={index}
                toChecked={!!allDependencies.find(({ to }) => to === taskId)}
                fromChecked={
                  !!allDependencies.find(({ from }) => from === taskId)
                }
                disableDragging={disableDragging}
              />
            </div>
          );
        })}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);

const ReactFlowState = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const pos = useStoreState((state) => state.transform);

  useEffect(() => {
    dispatch(
      roadmapsActions.setTaskmapPosition({
        x: pos[0],
        y: pos[1],
        zoom: pos[2],
      }),
    );
  }, [dispatch, pos]);

  return null;
};

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

  const groups = taskRelations.map(({ synergies }, idx) => ({
    id: `${idx}`,
    type: 'special',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    position: { x: 550 * idx, y: 80 },
    data: {
      label: (
        <TaskComponent
          listId={idx}
          taskIds={synergies.sort((a, b) => a - b)} // ordering prevents render bugs
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          allDependencies={taskRelations.flatMap(
            ({ dependencies }) => dependencies,
          )}
          disableDragging={disableDrag}
        />
      ),
    },
  }));

  const edges = taskRelations.flatMap(({ dependencies }, idx) =>
    dependencies.map(({ from, to }) => {
      const targetGroupIdx = taskRelations.findIndex(({ synergies }) =>
        synergies.includes(to),
      );

      return {
        id: `from-${from}-to-${to}`,
        source: String(idx),
        sourceHandle: `from-${from}`,
        target: String(targetGroupIdx),
        targetHandle: `to-${to}`,
        type: 'custom',
      };
    }),
  );

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
    const res = await dispatch(
      roadmapsActions.addSynergyRelations({ from, to }),
    );
    if (roadmapsActions.addSynergyRelations.rejected.match(res))
      throw new Error();
  };

  const onDragMoveOutside = async (
    draggedTaskId: number,
    copyList: GroupedRelation[],
  ) => {
    const newList = copyList
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
    copyList: GroupedRelation[],
  ) => {
    const destinationId = Number(destination.droppableId);

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
    const copyList = copyRelationList(taskRelations);

    try {
      if (!destination) await onDragMoveOutside(draggedTaskId, copyList);
      else if (source.droppableId !== destination.droppableId)
        await onDragMoveToGroup(source, destination, draggedTaskId, copyList);
    } catch (err) {
      setTaskRelations(backupList);
    } finally {
      setDisableDrag(false);
    }
  };

  return (
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
        <ReactFlow
          className={classes(css.flowContainer)}
          connectionLineComponent={ConnectionLine}
          elements={[...groups, ...edges]}
          nodeTypes={{
            special: CustomNodeComponent,
          }}
          draggable={false}
          onConnect={onConnect}
          edgeTypes={{
            custom: CustomEdge,
          }}
          onContextMenu={(e) => e.preventDefault()}
          defaultZoom={mapPosition?.zoom}
          defaultPosition={mapPosition && [mapPosition.x, mapPosition.y]}
        >
          <ReactFlowState />
          <Controls showInteractive={false} showZoom={false}>
            <InfoTooltip title={t('Taskmap-tooltip')}>
              <InfoIcon
                className={classes(css.info, css.tooltipIcon, css.infoIcon)}
              />
            </InfoTooltip>
          </Controls>
        </ReactFlow>
        <div className={classes(css.taskOverviewContainer)}>
          {selectedTask && (
            <OverviewContent {...getTaskOverviewData(selectedTask, false)} />
          )}
        </div>
      </DragDropContext>
    </div>
  );
};
