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
import { Roadmap, Task } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import { TaskRatingsText } from '../components/TaskRatingsText';
import { groupTaskRelations } from '../utils/TaskRelationUtils';
import { getTaskOverviewData } from './TaskOverviewPage';
import { OverviewContent } from '../components/Overview';
import css from './TaskMapPage.module.scss';
import { roadmapsActions } from '../redux/roadmaps';

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
}> = ({ taskId, setSelectedTask, selected }) => {
  const task = useSelector<RootState, Task | undefined>(
    taskSelector(taskId),
    shallowEqual,
  );
  if (task)
    return (
      <button
        type="button"
        onClick={
          selected
            ? () => setSelectedTask(undefined)
            : () => setSelectedTask(task)
        }
        className={
          selected ? classes(css.selectedTask) : classes(css.singleTask)
        }
      >
        <Handle
          className={classes(css.leftHandle)}
          id={`to-${task!.id}`}
          type="target"
          position={Position.Left}
        />
        {task!.name}
        <div className={classes(css.taskRatingTexts)}>
          <TaskRatingsText task={task!} selected={selected} />
        </div>
        <Handle
          className={classes(css.rightHandle)}
          id={`from-${task!.id}`}
          type="source"
          position={Position.Right}
        />
      </button>
    );
  return <></>;
};

const TaskComponent: FC<{
  taskIds: number[];
  selectedTask: Task | undefined;
  setSelectedTask: any;
}> = ({ taskIds, selectedTask, setSelectedTask }) => {
  return (
    <div className={classes(css.taskContainer)}>
      {taskIds.map((taskId) => {
        return (
          <div key={taskId}>
            <SingleTask
              taskId={taskId}
              selected={selectedTask?.id === taskId}
              setSelectedTask={setSelectedTask}
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

const nodeTypes = {
  special: CustomNodeComponent,
};

export const TaskMapPage = () => {
  const tasks = useSelector(allTasksSelector, shallowEqual);
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

  const elements = [...groups, ...edges];

  const onConnect = async (data: any) => {
    const { sourceHandle, targetHandle } = data;
    const roadmapId = currentRoadmap?.id;
    const type = 0; // Type 0 = dependency

    // Handles are in form 'from-{id}' and 'to-{id}', splitting required
    const from = sourceHandle.includes('from')
      ? Number(sourceHandle.split('-')[1])
      : Number(targetHandle.split('-')[1]);

    const to = targetHandle.includes('to')
      ? Number(targetHandle.split('-')[1])
      : Number(sourceHandle.split('-')[1]);

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
        elements={elements}
        nodeTypes={nodeTypes}
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
