/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ReactFlow, { Handle } from 'react-flow-renderer';
import classNames from 'classnames';
// import CircleTwoToneIcon from '@mui/material-ui/icons/CircleTwoTone';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { RootState } from '../redux/types';
import { allTasksSelector, taskSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from '../components/TaskRatingsText';
import { groupTaskRelations } from '../utils/TaskRelationUtils';

import css from './TaskMapPage.module.scss';

const classes = classNames.bind(css);

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
            : () => setSelectedTask(task)
        }
        className={
          selected ? classes(css.selectedTask) : classes(css.singleTask)
        }
      >
        <RadioButtonUncheckedIcon className={classes(css.leftTaskIcon)} />
        <Handle
          id={`to-${task!.id}`}
          type="target"
          position={Position.Left}
          style={{ borderRadius: 0 }}
        />
        {task!.name}
        <div className={classes(css.taskRatingTexts)}>
          <TaskRatingsText task={task!} selected={selected} />
        </div>
        <RadioButtonUncheckedIcon className={classes(css.rightTaskIcon)} />
        <Handle
          id={`from-${task!.id}`}
          type="source"
          position={Position.Right}
          style={{ borderRadius: 0 }}
        />
      </button>
    );
  return <></>;
};

const TaskComponent: FC<{
  taskIds: number[];
  selectedTaskId: number | undefined;
  setSelectedTaskId: any;
  position: number;
}> = ({ taskIds, selectedTaskId, setSelectedTaskId, position }) => {
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

const customNodeStyles = {
  backGroundColor: 'red',
  border: '1px solid black',
  width: '370px',
};

const CustomNodeComponent: FC<{ data: any }> = ({ data }) => {
  return (
    <div style={customNodeStyles}>
      {data.taskIds.map((taskId: number) => (
        <SingleTask
          taskId={taskId}
          selected={data.selected}
          setSelectedTask={data.setSelectedTask}
        />
      ))}
      <div>{data.length}</div>
    </div>
  );
};

const nodeTypes = {
  special: CustomNodeComponent,
};

export const TaskMapPage = () => {
  const tasks = useSelector(allTasksSelector, shallowEqual);
  const taskRelations = groupTaskRelations(tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );

  const groups = taskRelations.map(({ synergies }, idx) => ({
    id: `${idx}`,
    type: 'special',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    selectable: false,
    position: { x: 550 * idx, y: 80 },
    data: {
      label: (
        <TaskComponent
          taskIds={synergies}
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
          position={0}
        />
      ),
      taskIds: synergies,
      selectedTaskId,
      setSelectedTaskId,
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
      };
    }),
  );

  const elements = [...groups, ...edges];

  return (
    <>
      <ReactFlow
        style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          height: '600px',
          marginTop: '10px',
        }}
        elements={elements}
        nodeTypes={nodeTypes}
        draggable={false}
      />
      <PlaceHolderComp taskId={selectedTaskId} />
    </>
  );
};
