/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ReactFlow, { Handle } from 'react-flow-renderer';
import classNames from 'classnames';
// import CircleTwoToneIcon from '@mui/material-ui/icons/CircleTwoTone';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { allTasksSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from '../components/TaskRatingsText';

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
  task: Task | undefined;
}> = ({ task }) => {
  if (!task) return <div>taskia ei selectattu</div>;
  return <div>{task.name}</div>;
};

// To do: Lisää Taskille mahdollisuus olla completed, jolloin sen tekstit on vihreet
const SingleTask: FC<{
  task: Task;
  selected?: boolean;
  setSelectedTask?: any;
}> = ({ task, setSelectedTask, selected }) => {
  return (
    <button
      type="button"
      onClick={
        selected
          ? () => setSelectedTask(undefined)
          : () => setSelectedTask(task)
      }
      className={selected ? classes(css.selectedTask) : classes(css.singleTask)}
    >
      <RadioButtonUncheckedIcon className={classes(css.leftTaskIcon)} />
      <Handle
        id={`left-${task.id}`}
        type="target"
        position={Position.Left}
        style={{ borderRadius: 0 }}
      />
      {task.name}
      <div className={classes(css.taskRatingTexts)}>
        <TaskRatingsText task={task} selected={selected} />
      </div>
      <RadioButtonUncheckedIcon className={classes(css.rightTaskIcon)} />
      <Handle
        id={`right-${task.id}`}
        type="source"
        position={Position.Right}
        style={{ borderRadius: 0 }}
      />
    </button>
  );
};

const TaskComponent: FC<{
  tasks: Task[];
  selectedTask: Task | undefined;
  setSelectedTask: any;
  position: number;
}> = ({ tasks, selectedTask, setSelectedTask, position }) => {
  return (
    <div className={classes(css.taskContainer)}>
      {tasks.map((task) => {
        return (
          <div>
            <SingleTask
              task={task}
              selected={selectedTask?.id === task.id}
              setSelectedTask={setSelectedTask}
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
      {data.tasks.map((task: Task) => (
        <SingleTask
          task={task}
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
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const elements = [
    {
      id: '1',
      type: 'special',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      selectable: false,
      data: {
        label: (
          <TaskComponent
            tasks={tasks.slice(0, 3)}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            position={0}
          />
        ),
        tasks: tasks.slice(0, 3),
        selectedTask,
        setSelectedTask,
      },
      position: { x: 0, y: 80 },
    },
    {
      id: '3',
      type: 'special',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      selectable: false,
      data: {
        label: (
          <TaskComponent
            tasks={tasks.slice(4, 6)}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            position={1}
          />
        ),
        tasks: tasks.slice(4, 6),
      },
      position: { x: 700, y: 100 },
    },
    { id: 'e1-3', source: '1', target: '3' },
  ];

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
      <PlaceHolderComp task={selectedTask} />
    </>
  );
};
