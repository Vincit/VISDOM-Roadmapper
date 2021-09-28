import { FC, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ReactFlow, { Handle } from 'react-flow-renderer';
import classNames from 'classnames';
import { RootState } from '../redux/types';
import { allTasksSelector, taskSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from '../components/TaskRatingsText';
import { groupTaskRelations } from '../utils/TaskRelationUtils';

import css from './TaskMapPage.module.scss';

const classes = classNames.bind(css);

// Node positions require special Position-enum in typescript
enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

// Tähän on olemassa valmis komponentti
const PlaceHolderComp: FC<{
  taskId: number | undefined;
}> = ({ taskId }) => {
  if (!taskId) return <div>taskia ei selectattu</div>;
  return <div>{taskId}</div>;
};

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
            : () => setSelectedTask(taskId)
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
  selectedTaskId: number | undefined;
  setSelectedTaskId: any;
}> = ({ taskIds, selectedTaskId, setSelectedTaskId }) => {
  return (
    <div className={classes(css.taskContainer)}>
      {taskIds.map((taskId) => {
        return (
          <div>
            <SingleTask
              taskId={taskId}
              selected={selectedTaskId === taskId}
              setSelectedTask={setSelectedTaskId}
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
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const taskRelations = groupTaskRelations(tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );

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
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
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
        id: `${idx}-${targetGroupIdx}`,
        source: String(idx),
        sourceHandle: `from-${from}`,
        target: String(targetGroupIdx),
        targetHandle: `to-${to}`,
        style: { stroke: 'green' },
      };
    }),
  );

  const elements = [...groups, ...edges];

  return (
    <>
      <ReactFlow
        className={classes(css.flowContainer)}
        elements={elements}
        nodeTypes={nodeTypes}
        draggable={false}
      />
      <PlaceHolderComp taskId={selectedTaskId} />
    </>
  );
};
