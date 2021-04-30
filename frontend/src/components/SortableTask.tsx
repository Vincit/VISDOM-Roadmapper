import React, { useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { shallowEqual, useSelector } from 'react-redux';
import { Task } from '../redux/roadmaps/types';
import { TaskRatingsText } from './TaskRatingsText';
import css from './SortableTask.module.scss';
import { allTasksSelector } from '../redux/roadmaps/selectors';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';

interface VersionListsObject {
  [K: string]: Task[];
}

export const SortableTask: React.FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
}> = ({ task, index, disableDragging }) => {
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const [roadmapsVersionsLocal, setRoadmapsVersionsLocal] = useState<
    undefined | Version[]
  >(undefined);
  const [unversionedTasks, setUnversionedTasks] = useState<Task[]>();

  useEffect(() => {
    setRoadmapsVersionsLocal(roadmapsVersions);
  }, [roadmapsVersions]);

  useEffect(() => {
    if (roadmapsVersionsLocal === undefined) return;
    const newVersionLists: VersionListsObject = {};
    const unversioned = new Map(tasks.map((task) => [task.id, task]));
    roadmapsVersionsLocal.forEach((v) => {
      newVersionLists[v.id] = v.tasks;
      v.tasks.forEach((t) => unversioned.delete(t.id));
    });
    setUnversionedTasks(Array.from(unversioned.values()));
  }, [roadmapsVersionsLocal, tasks]);

  return (
    <Draggable
      key={task.id}
      draggableId={`${task.id}`}
      index={index}
      isDragDisabled={disableDragging}
    >
      {(provided) => (
        <div
          className={css.taskDiv}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={css.leftSideDiv}>{task.name}</div>
          <div className={css.rightSideDiv}>
            <div>
              {unversionedTasks &&
                unversionedTasks.some((obj) => obj.id === task.id) && (
                  <TaskRatingsText task={task} />
                )}
            </div>
            <DragIndicatorIcon fontSize="small" />
          </div>
        </div>
      )}
    </Draggable>
  );
};
