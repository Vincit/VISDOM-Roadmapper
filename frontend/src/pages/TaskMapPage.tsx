import { FC, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import ReactFlow, { Handle } from 'react-flow-renderer';
import classNames from 'classnames';
import { RootState } from '../redux/types';
import {
  allTasksSelector,
  chosenRoadmapSelector,
  taskSelector,
} from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps';
import { Roadmap, Task, TaskRelation } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import { TaskRatingsText } from '../components/TaskRatingsText';
import { groupTaskRelations } from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import { TaskRelationType } from '../../../shared/types/customTypes';
import css from './TaskMapPage.module.scss';

const classes = classNames.bind(css);

// Node positions require special Position-enum in typescript
enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

// To do: Lisää Taskille mahdollisuus olla completed, jolloin sen tekstit on vihreet
const SingleTask: FC<{
  taskId: number;
  selected?: boolean;
  setSelectedTask?: any;
  toChecked: boolean;
}> = ({ taskId, setSelectedTask, selected, toChecked }) => {
  const task = useSelector<RootState, Task | undefined>(
    taskSelector(taskId),
    shallowEqual,
  );
  const fromRelations = task?.relations.some(
    (relation) =>
      relation.type === TaskRelationType.Dependency &&
      relation.from === task?.id,
  );

  if (!task) return null;
  return (
    <button
      type="button"
      onClick={
        selected
          ? () => setSelectedTask(undefined)
          : () => setSelectedTask(task)
      }
      className={classes(css.singleTask, {
        [css.selectedTask]: selected,
        [css.completedTask]: task.completed && !selected,
      })}
    >
      <Handle
        className={classes(css.leftHandle, {
          [css.filledLeftHandle]: toChecked,
        })}
        id={`to-${task!.id}`}
        type="target"
        position={Position.Left}
      />
      {task!.name}
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText
          task={task!}
          selected={selected}
          completed={task.completed}
          largeIcons
        />
      </div>
      <Handle
        className={classes(css.rightHandle, {
          [css.filledRightHandle]: fromRelations,
        })}
        id={`from-${task!.id}`}
        type="source"
        position={Position.Right}
      />
    </button>
  );
};

const TaskComponent: FC<{
  taskIds: number[];
  selectedTask: Task | undefined;
  setSelectedTask: any;
  allRelations: TaskRelation[][];
}> = ({ taskIds, selectedTask, setSelectedTask, allRelations }) => {
  const toDependencies = new Set(
    allRelations
      .flat()
      .filter((relation) => relation.type === TaskRelationType.Dependency)
      .map(({ to }) => to),
  );
  return (
    <div className={classes(css.taskContainer)}>
      {taskIds.map((taskId) => {
        return (
          <div key={taskId}>
            <SingleTask
              taskId={taskId}
              selected={selectedTask?.id === taskId}
              setSelectedTask={setSelectedTask}
              toChecked={toDependencies.has(taskId)}
            />
          </div>
        );
      })}
    </div>
  );
};

const CustomNodeComponent: FC<{ data: any }> = ({ data }) => {
  return <div>{data.label}</div>;
};

export const TaskMapPage = () => {
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const dispatch = useDispatch<StoreDispatchType>();
  const taskRelations = groupTaskRelations(tasks);
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
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
        style: { stroke: 'green' },
      };
    }),
  );

  const onConnect = async (data: any) => {
    const { sourceHandle, targetHandle } = data;
    const roadmapId = currentRoadmap?.id;
    const type = TaskRelationType.Dependency;

    // Handles are in form 'from-{id}' and 'to-{id}', splitting required
    const from = Number(sourceHandle.split('-')[1]);
    const to = Number(targetHandle.split('-')[1]);

    if (!roadmapId) return;
    await dispatch(
      roadmapsActions.addTaskRelation({
        from,
        to,
        type,
        roadmapId,
      }),
    );
    dispatch(roadmapsActions.getRoadmaps());
  };

  return (
    <>
      <ReactFlow
        className={classes(css.flowContainer)}
        elements={[...groups, ...edges]}
        nodeTypes={{
          special: CustomNodeComponent,
        }}
        draggable={false}
        onConnect={onConnect}
      />
      <div className={classes(css.taskOverviewContainer)}>
        {selectedTask && (
          <OverviewContent {...getTaskOverviewData(selectedTask, false)} />
        )}
      </div>
    </>
  );
};