import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LayoutCol, LayoutRow } from '../components/CommonLayoutComponents';
import { DeleteButton } from '../components/forms/DeleteButton';
import { SortableTaskList } from '../components/SortableTaskList';
import { ReactComponent as PlusIcon } from '../icons/plus_icon.svg';
import { StoreDispatchType } from '../redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { versionsActions } from '../redux/versions';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';

const GraphPlaceHolder = styled.div`
  border-radius: 16px;
  background-color: rgb(225, 225, 225);
  min-width: 100%;
  min-height: 550px;
`;

const ColumnHeader = styled.span`
  text-align: left;
  border-bottom: 1px solid black;
  font-size: 24px;
  line-height: 32px;
  font-weight: bold;
  padding-top: 16px;
  padding-bottom: 24px;
`;

const VersionHeader = styled.span`
  display: flex;
  text-align: left;
  border-bottom: 1px solid black;
  margin-bottom: 16px;
  padding-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
`;

const VersionColumn = styled(LayoutCol)`
  padding: 8px;
  min-height: 400px;
  width: 50%;
  overflow-y: visible;
`;

const DeleteButtonWrapper = styled.div`
  margin-left: auto;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  margin-bottom: 8px;
  min-height: 150px;
  padding: 16px;
  border-radius: 16px;
  background-color: #f3f3f3;
`;

const AddVersionWrapper = styled(ListWrapper)`
  justify-content: center;
  background-color: rgba(0, 0, 0, 0);
  border: 1px dashed black;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  svg {
    margin: 4px;
  }
`;

interface VersionListsObject {
  [K: string]: Task[];
}

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
    [droppableSource.droppableId]: sourceClone,
    [droppableDestination.droppableId]: destClone,
  };
};

const copyVersionLists = (originalLists: VersionListsObject) => {
  const copyList: VersionListsObject = {};
  Object.keys(originalLists).forEach((key) => {
    copyList[key] = [...originalLists[key]];
  });
  return copyList;
};

const ROADMAP_LIST_ID = '-1';

export const PlannerPage = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const [versionLists, setVersionLists] = useState<VersionListsObject>({});
  const [disableDrag, setDisableDrag] = useState(false);
  const [disableUpdates, setDisableUpdates] = useState(false);

  const onDragStart = () => {
    setDisableDrag(true);
  };

  const onDragReorder = async (result: DropResult) => {
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    // Reordering inside one list
    copyLists[source!.droppableId] = reorderList(
      copyLists[source!.droppableId],
      source!.index,
      destination!.index,
    );

    setVersionLists(copyLists);
    if (destination?.droppableId === ROADMAP_LIST_ID) return Promise.resolve();

    const res = await dispatch(
      versionsActions.patchVersion({
        id: +source.droppableId,
        tasks: copyLists[source!.droppableId].map((task) => task.id),
      }),
    );
    if (versionsActions.patchVersion.rejected.match(res)) {
      return Promise.reject();
    }
    return Promise.resolve();
  };

  const onDragMoveToList = async (result: DropResult) => {
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    // Moving from one list to another
    Object.assign(
      copyLists,
      moveBetweenLists(
        copyLists[source!.droppableId],
        copyLists[destination!.droppableId],
        source!,
        destination!,
      ),
    );
    setVersionLists(copyLists);

    setDisableUpdates(true);
    if (destination?.droppableId !== ROADMAP_LIST_ID) {
      // If moving to another version -> add to new version
      const addRes = await dispatch(
        versionsActions.addTaskToVersion({
          version: { id: +destination!.droppableId! },
          task: {
            id: +result.draggableId,
          },
          index: destination!.index,
        }),
      );
      if (versionsActions.addTaskToVersion.rejected.match(addRes)) {
        setDisableUpdates(false);
        return Promise.reject();
      }
    }

    if (source?.droppableId !== ROADMAP_LIST_ID) {
      // If moving from another version -> remove from previous version
      const removeRes = await dispatch(
        versionsActions.removeTaskFromVersion({
          version: { id: +source!.droppableId! },
          task: {
            id: +result.draggableId,
          },
        }),
      );
      if (versionsActions.removeTaskFromVersion.rejected.match(removeRes)) {
        setDisableUpdates(false);
        return Promise.reject();
      }
    }
    setDisableUpdates(false);

    return Promise.resolve();
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // Ignore drag if dropping in same position
    if (
      !destination ||
      (source.index === destination.index &&
        source.droppableId === destination.droppableId)
    ) {
      setDisableDrag(false);
      return;
    }

    // Backup list that is not mutated, used for reverting action if api request fails
    const backupLists = copyVersionLists(versionLists);
    let res: Promise<void> | undefined;
    if (source.droppableId === destination.droppableId) {
      res = onDragReorder(result);
    } else {
      res = onDragMoveToList(result);
    }

    try {
      await res;
      setDisableDrag(false);
    } catch (e) {
      setVersionLists(backupLists);
      setDisableDrag(false);
    }
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

  useEffect(() => {
    if (disableUpdates) return;
    if (roadmapsVersions === undefined) {
      dispatch(versionsActions.getVersions());
    } else {
      const newVersionLists: VersionListsObject = {};
      newVersionLists[ROADMAP_LIST_ID] = [];
      currentRoadmap.tasks.forEach((t) => {
        let foundVersion = false;

        // Try to find version with this tasks id
        roadmapsVersions.forEach((v) => {
          if (!newVersionLists[v.id]) newVersionLists[v.id] = [];
          if (v.tasks.includes(t.id)) {
            newVersionLists[v.id].push(t);
            newVersionLists[v.id].sort(
              (a, b) => v.tasks.indexOf(a.id) - v.tasks.indexOf(b.id),
            );
            foundVersion = true;
          }
        });

        // If no version for task is found, add to roadmaps tasklist (unversioned tasks)
        if (!foundVersion) {
          newVersionLists[ROADMAP_LIST_ID].push(t);
        }
      });

      setVersionLists(newVersionLists);
    }
  }, [dispatch, roadmapsVersions, currentRoadmap.tasks, disableUpdates]);

  const renderVersionLists = () => {
    return (
      <>
        {roadmapsVersions &&
          roadmapsVersions.map((version) => {
            return (
              <ListWrapper key={version.id}>
                <VersionHeader>
                  {version.name}
                  <DeleteButtonWrapper>
                    <DeleteButton onClick={() => deleteVersion(version.id)} />
                  </DeleteButtonWrapper>
                </VersionHeader>
                <SortableTaskList
                  listId={`${version.id}`}
                  tasks={versionLists[version.id] || []}
                  disableDragging={disableDrag}
                />
              </ListWrapper>
            );
          })}
        <AddVersionWrapper onClick={addVersion}>
          <span>
            <PlusIcon />
            <Trans i18nKey="Add new" />
          </span>
        </AddVersionWrapper>
      </>
    );
  };

  return (
    <>
      <GraphPlaceHolder />
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <LayoutRow>
          <VersionColumn>
            <ColumnHeader>
              {currentRoadmap.name} <Trans i18nKey="task list" />
            </ColumnHeader>
            <ListWrapper>
              <SortableTaskList
                listId={ROADMAP_LIST_ID}
                tasks={versionLists[ROADMAP_LIST_ID] || []}
                disableDragging={false}
              />
            </ListWrapper>
          </VersionColumn>
          <VersionColumn>
            <ColumnHeader>
              {currentRoadmap.name} <Trans i18nKey="milestones" />
            </ColumnHeader>
            {renderVersionLists()}
          </VersionColumn>
        </LayoutRow>
      </DragDropContext>
    </>
  );
};
