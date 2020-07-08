import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';
import { Button, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  ColumnHeader,
  Divider,
  PaddinglessRow,
  TopBarWithBorder,
} from '../components/CommonLayoutComponents';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SortableTaskList } from '../components/SortableTaskList';
import { StoreDispatchType } from '../redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { versionsActions } from '../redux/versions';
import {
  roadmapsVersionsSelector,
  selectedVersionSelector,
} from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';

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

export const PlannerPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const currentVersion = useSelector<RootState, Version | undefined>(
    selectedVersionSelector,
    shallowEqual,
  );

  const [taskLists, setTasks] = useState({
    [ListId.RoadmapTasks]: [] as Task[],
    [ListId.VersionTasks]: [] as Task[],
  });

  const [disableDragging, setDisableDragging] = useState(false);

  useEffect(() => {
    if (roadmapsVersions === undefined) {
      dispatch(versionsActions.getVersions());
    }
  }, [roadmapsVersions, dispatch]);

  useEffect(() => {
    setDisableDragging(true);
    let roadmapTasks = [] as Task[];
    roadmapTasks = currentRoadmap!.tasks;
    setTasks(() => {
      return {
        [ListId.RoadmapTasks]: roadmapTasks.filter((task) => {
          if (!currentVersion) return true; // Show all tasks in this list if no version selected
          return !currentVersion.tasks.includes(task.id);
        }),
        [ListId.VersionTasks]: roadmapTasks
          .filter((task) => {
            if (!currentVersion) return false; // Show no tasks here if no version selected
            return currentVersion.tasks.includes(task.id);
          })
          .sort(
            (a, b) =>
              currentVersion!.tasks.indexOf(a.id) -
              currentVersion!.tasks.indexOf(b.id),
          ),
      };
    });
    setDisableDragging(false);
  }, [currentRoadmap, currentVersion]);

  const onDragStart = () => {
    setDisableDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (
      !destination ||
      (source.index === destination.index &&
        source.droppableId === destination.droppableId)
    ) {
      setDisableDragging(false);
      return;
    }

    // We need original copy to revert re-ordering if api request doesnt go through
    const taskListsBackup = {
      [ListId.RoadmapTasks]: taskLists[ListId.RoadmapTasks],
      [ListId.VersionTasks]: taskLists[ListId.VersionTasks],
    };

    // TODO Use immutability helper to mutate state
    // TODO Perhaps only save lists on exit / save button
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
      // Always initially re-order lists before request is finished
      setTasks(taskListsCopy);
      if (source.droppableId === ListId.VersionTasks) {
        // If we are re-ordering a versions tasks
        setDisableDragging(true);
        dispatch(
          versionsActions.patchVersion({
            id: currentVersion!.id,
            tasks: taskListsCopy[ListId.VersionTasks].map((task) => task.id),
          }),
        ).then((res) => {
          // Revert task re-ordering if request fails
          if (versionsActions.patchVersion.rejected.match(res)) {
            setDisableDragging(false);
            setTasks(taskListsBackup);
          }
        });
      } else {
        setDisableDragging(false);
      }
    } else {
      // TODO dispatch add&remove task from version actions
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
      setDisableDragging(false);
      if (destination.droppableId === ListId.VersionTasks) {
        dispatch(
          versionsActions.addTaskToVersion({
            version: currentVersion!,
            task: {
              id: +result.draggableId,
            },
            index: destination.index,
          }),
        ).then((res) => {
          // Revert task re-ordering if request fails
          if (versionsActions.addTaskToVersion.rejected.match(res)) {
            setDisableDragging(false);
            setTasks(taskListsBackup);
          }
        });
      } else {
        dispatch(
          versionsActions.removeTaskFromVersion({
            version: currentVersion!,
            task: {
              id: +result.draggableId,
            },
          }),
        ).then((res) => {
          // Revert task re-ordering if request fails
          if (versionsActions.removeTaskFromVersion.rejected.match(res)) {
            setDisableDragging(false);
            setTasks(taskListsBackup);
          }
        });
      }
    }
  };

  const selectVersion = (id: number | undefined) => {
    dispatch(versionsActions.selectVersionId(id));
  };

  const deleteVersion = (id: number) => {
    dispatch(versionsActions.deleteVersion({ id }));
  };

  const addVersion = () => {
    dispatch(
      versionsActions.addVersion({
        name: `Version ${Math.floor(Math.random() * 999999)}`,
      }),
    );
  };

  const renderTopbar = () => {
    return (
      <TopBarWithBorder className="justify-content-start">
        <Button onClick={() => selectVersion(undefined)} className="m-1">
          <Trans i18nKey="Roadmap View" />
        </Button>
        {roadmapsVersions &&
          roadmapsVersions.map((version) => (
            <Button
              key={version.id}
              onClick={() => {
                selectVersion(version.id);
              }}
              onContextMenu={(
                e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
              ) => {
                e.preventDefault();
                deleteVersion(version.id);
              }}
              className="m-1"
            >
              {version.name}
            </Button>
          ))}
        <Button onClick={() => addVersion()} variant="success" className="m-1">
          + Add new version
        </Button>
      </TopBarWithBorder>
    );
  };

  const renderRoadmapList = () => {
    return (
      <PaddinglessRow
        className={currentVersion ? 'h-50 mh-50 bottomborder' : 'flex-grow-1'}
      >
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
              disableDragging={disableDragging}
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
            {`${currentVersion?.name} `}
            <Trans i18nKey="task list" />
            <Divider />
          </ColumnHeader>
          <ListContainer>
            <SortableTaskList
              listId={ListId.VersionTasks}
              tasks={taskLists[ListId.VersionTasks]}
              disableDragging={disableDragging}
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
      {roadmapsVersions ? (
        <div className="h-100 d-flex flex-column">
          <PaddinglessRow>{renderTopbar()}</PaddinglessRow>
          <div className="flex-grow-1">
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
              {renderRoadmapList()}
              {currentVersion && renderVersionList()}
            </DragDropContext>
          </div>
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};
