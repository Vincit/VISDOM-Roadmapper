import { FC, useEffect, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import ReactFlow, { Controls, useStoreState } from 'react-flow-renderer';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { useTranslation } from 'react-i18next';
import {
  allTasksSelector,
  taskmapPositionSelector,
} from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps';
import { Task, TaskRelation } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import { groupTaskRelations } from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import { TaskRelationType } from '../../../shared/types/customTypes';
import { CustomEdge } from '../components/TaskMapEdge';
import { ConnectionLine } from '../components/TaskMapConnection';
import { DraggableSingleTask, Position } from '../components/TaskMapTask';
import css from './TaskMapPage.module.scss';
import { InfoTooltip } from '../components/InfoTooltip';

const classes = classNames.bind(css);

const TaskComponent: FC<{
  listId: number;
  taskIds: number[];
  selectedTask: Task | undefined;
  setSelectedTask: any;
  allRelations: TaskRelation[][];
}> = ({ listId, taskIds, selectedTask, setSelectedTask, allRelations }) => {
  const toDependencies = new Set(
    allRelations
      .flat()
      .filter((relation) => relation.type === TaskRelationType.Dependency)
      .map(({ to }) => to),
  );
  return (
    <Droppable droppableId={String(listId)} type="TASKS">
      {(provided, snapshot) => (
        <div
          className={classes(css.taskContainer, {
            [css.highlight]: snapshot.isDraggingOver,
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
                  toChecked={toDependencies.has(taskId)}
                />
              </div>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

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
  const taskRelations = groupTaskRelations(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

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
          taskIds={synergies}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          allRelations={tasks.map((task) => task.relations)}
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

  return (
    <div
      id="taskmap"
      style={{
        ['--zoom' as any]: mapPosition?.zoom || 1,
      }}
    >
      <DragDropContext onDragEnd={() => {}} onDragStart={() => {}}>
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
