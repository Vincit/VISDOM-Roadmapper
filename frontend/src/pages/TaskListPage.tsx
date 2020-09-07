import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { TaskTable } from '../components/TaskTable';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';

export const TaskListPage = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  return <TaskTable tasks={currentRoadmap!.tasks} />;
};
