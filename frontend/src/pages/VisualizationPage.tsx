import React, { useState } from 'react';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';
import { shallowEqual, useSelector } from 'react-redux';
import { PaddinglessRow } from '../components/CommonLayoutComponents';
import { SortableTaskList } from '../components/SortableTaskList';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';

// Function to help us with reordering item in list
const reorderList = (list: Task[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Function to help us move items between lists
const moveBetweenLists = (
  source: Task[],
  destination: Task[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation,
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return {
    [droppableSource.droppableId as ListId]: sourceClone,
    [droppableDestination.droppableId as ListId]: destClone,
  };
};

enum ListId {
  First = 'FIRST_LIST',
  Second = 'SECOND_LIST',
}

export const VisualizationPage = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const initialTasks: Task[] = currentRoadmap?.tasks || [];
  const [taskLists, setTasks] = useState({
    [ListId.First]: initialTasks,
    [ListId.Second]: [] as Task[],
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      // TODO Use immutability helper or something here
      const taskListsCopy = {
        [ListId.First]: taskLists[ListId.First],
        [ListId.Second]: taskLists[ListId.Second],
      };
      taskListsCopy[source.droppableId as ListId] = reorderList(
        taskListsCopy[source.droppableId as ListId],
        source.index,
        destination.index,
      );
      setTasks(taskListsCopy);
    } else {
      const newLists = moveBetweenLists(
        taskLists[source.droppableId as ListId],
        taskLists[destination.droppableId as ListId],
        source,
        destination,
      );

      const taskListsCopy = {
        [ListId.First]: newLists[ListId.First],
        [ListId.Second]: newLists[ListId.Second],
      };
      setTasks(taskListsCopy);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <PaddinglessRow>
        <SortableTaskList
          listId={ListId.First}
          tasks={taskLists[ListId.First]}
        />
        <SortableTaskList
          listId={ListId.Second}
          tasks={taskLists[ListId.Second]}
        />
      </PaddinglessRow>
    </DragDropContext>
  );
};
