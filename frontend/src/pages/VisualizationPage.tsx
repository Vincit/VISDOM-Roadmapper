import React, { useState } from 'react';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';
import { Button, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  ColumnHeader,
  Divider,
  PaddinglessRow,
  TopBarWithBorder,
} from '../components/CommonLayoutComponents';
import { SortableTaskList } from '../components/SortableTaskList';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';

const ListContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;
// Function to help with reordering item in list
const reorderList = (list: Task[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Function to help move items between lists
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
  RoadmapTasks = 'ROADMAP_TASKS',
  VersionTasks = 'VERSION_TASKS',
}

export const VisualizationPage = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const initialTasks: Task[] = currentRoadmap?.tasks || [];
  const [taskLists, setTasks] = useState({
    [ListId.RoadmapTasks]: initialTasks,
    [ListId.VersionTasks]: [] as Task[],
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // TODO Use immutability helper to mutate state
    if (source.droppableId === destination.droppableId) {
      const taskListsCopy = {
        [ListId.RoadmapTasks]: taskLists[ListId.RoadmapTasks],
        [ListId.VersionTasks]: taskLists[ListId.VersionTasks],
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
        [ListId.RoadmapTasks]: newLists[ListId.RoadmapTasks],
        [ListId.VersionTasks]: newLists[ListId.VersionTasks],
      };
      setTasks(taskListsCopy);
    }
  };

  const renderTopbar = () => {
    return (
      <TopBarWithBorder className="justify-content-start">
        <Button className="m-1">Roadmap view</Button>
        <Button className="m-1">Version X</Button>
        <Button className="m-1">Version Y</Button>
      </TopBarWithBorder>
    );
  };

  const renderRoadmapList = () => {
    return (
      <PaddinglessRow className="h-50 mh-50 bottomborder">
        <Col xs={5} className="h-100 mh-100 d-flex flex-column">
          <ColumnHeader>
            {`${currentRoadmap?.name} `}
            <Trans i18nKey="task list" />
            <Divider />
          </ColumnHeader>
          <ListContainer>
            <SortableTaskList
              listId={ListId.RoadmapTasks}
              tasks={taskLists[ListId.RoadmapTasks]}
            />
          </ListContainer>
        </Col>

        <Col>
          <ColumnHeader>
            {`${currentRoadmap?.name} `}
            <Divider />
          </ColumnHeader>
        </Col>
      </PaddinglessRow>
    );
  };

  const renderVersionList = () => {
    return (
      <PaddinglessRow className="h-50 mh-50">
        <Col xs={5} className="h-100 mh-100 d-flex flex-column">
          <ColumnHeader>
            <Trans i18nKey="Version name task list" />
            <Divider />
          </ColumnHeader>
          <ListContainer>
            <SortableTaskList
              listId={ListId.VersionTasks}
              tasks={taskLists[ListId.VersionTasks]}
            />
          </ListContainer>
        </Col>

        <Col>
          <ColumnHeader>
            {`${currentRoadmap?.name} `}
            <Divider />
          </ColumnHeader>
        </Col>
      </PaddinglessRow>
    );
  };

  return (
    <>
      <div className="h-100 d-flex flex-column">
        <PaddinglessRow>{renderTopbar()}</PaddinglessRow>
        <div className="flex-grow-1">
          <DragDropContext onDragEnd={onDragEnd}>
            {renderRoadmapList()}
            {renderVersionList()}
          </DragDropContext>
        </div>
      </div>
    </>
  );
};
