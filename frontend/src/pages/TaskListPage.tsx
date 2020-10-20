import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { TaskTable } from '../components/TaskTable';
import { allTasksSelector } from '../redux/roadmaps/selectors';

export const TaskListPage = () => {
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  return <TaskTable tasks={tasks} />;
};
