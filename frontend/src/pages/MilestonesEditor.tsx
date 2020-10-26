import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
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
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import {
  allTasksSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import { PublicUser, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { versionsActions } from '../redux/versions';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import {
  calcWeightedTaskPriority,
  dragDropBetweenLists,
  reorderList,
} from '../utils/TaskUtils';

const AddVersionWrapper = styled.div`
  width: 150px;
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
const Toolbar = styled.div`
  padding: 8px;
  border-bottom: 1px solid black;
  margin-bottom: 8px;
`;

const UnassignedTasksCol = styled(LayoutCol)`
  flex: 1;
  max-width: 350px;
  min-width: 350px;
  overflow-y: visible;
`;

const MilestoneCol = styled(LayoutCol)`
  min-width: 350px;
  max-width: 350px;
  overflow-y: visible;
  border-radius: 8px;
  margin-left: 16px;
`;

const UnassignedTasksHeader = styled.div`
  width: 100%;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: bold;
`;

const MilestoneHeader = styled.div`
  width: 100%;
  border-bottom: 1px solid gray;
  padding: 8px;
  font-size: 16px;
`;

const MilestoneFooter = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  border-top: 1px solid gray;
  padding: 8px;
  font-size: 16px;
`;

const SortableListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  min-height: 100px;
  padding: 16px;
  padding-top: 8px;
`;

const UnassignedTasksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 350px;
  border-radius: 16px;
  background-color: #f3f3f3;
`;

const MilestoneWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 150px;
  border-radius: 16px;
  background-color: #fbfbfb;
  border: 1px solid #f1f1f1;
  -webkit-box-shadow: 3px 3px 7px -4px rgba(0, 0, 0, 0.53);
  -moz-box-shadow: 3px 3px 7px -4px rgba(0, 0, 0, 0.53);
  box-shadow: 3px 3px 7px -4px rgba(0, 0, 0, 0.53);
`;

interface VersionListsObject {
  [K: string]: Task[];
}

const copyVersionLists = (originalLists: VersionListsObject) => {
  const copyList: VersionListsObject = {};
  Object.keys(originalLists).forEach((key) => {
    copyList[key] = [...originalLists[key]];
  });
  return copyList;
};

const ROADMAP_LIST_ID = '-1';

export const MilestonesEditor = () => {
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const [roadmapsVersionsLocal, setRoadmapsVersionsLocal] = useState<
    undefined | Version[]
  >(undefined);
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const [versionLists, setVersionLists] = useState<VersionListsObject>({});
  const [disableUpdates, setDisableUpdates] = useState(false);
  const [disableDrag, setDisableDrag] = useState(false);

  useEffect(() => {
    // Keeping a local copy of versions so we can immediately update this state on drag&drop, then get backend updated state from redux later
    setRoadmapsVersionsLocal(roadmapsVersions);
  }, [roadmapsVersions]);

  useEffect(() => {
    if (disableUpdates) return;
    if (roadmapsVersionsLocal === undefined) {
      dispatch(versionsActions.getVersions());
    } else {
      const newVersionLists: VersionListsObject = {};
      newVersionLists[ROADMAP_LIST_ID] = [];
      tasks.forEach((t) => {
        let foundVersion = false;

        // Try to find version with this tasks id
        roadmapsVersionsLocal.forEach((v) => {
          if (!newVersionLists[v.id]) newVersionLists[v.id] = [];
          if (v.tasks.includes(t.id)) {
            newVersionLists[v.id].push(t);
            foundVersion = true;
          }
        });

        // If no version for task is found, add to roadmaps tasklist (unversioned tasks)
        if (!foundVersion) {
          newVersionLists[ROADMAP_LIST_ID].push(t);
        }
      });

      // Sort tasks
      roadmapsVersionsLocal.forEach((v) =>
        newVersionLists[v.id].sort(
          (a, b) => v.tasks.indexOf(a.id) - v.tasks.indexOf(b.id),
        ),
      );
      newVersionLists[ROADMAP_LIST_ID].sort(
        (a, b) =>
          calcWeightedTaskPriority(b, publicUsers!) -
          calcWeightedTaskPriority(a, publicUsers!),
      );

      setVersionLists(newVersionLists);
    }
  }, [dispatch, roadmapsVersionsLocal, tasks, disableUpdates, publicUsers]);

  const addVersion = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_VERSION_MODAL,
        modalProps: {},
      }),
    );
  };

  const deleteVersion = (id: number) => {
    dispatch(versionsActions.deleteVersion({ id }));
  };

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
      dragDropBetweenLists(
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

  const onTaskDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // Backup list that is not mutated, used for reverting action if api request fails
    const backupLists = copyVersionLists(versionLists);
    let res: Promise<void> | undefined;
    if (source.droppableId === destination!.droppableId) {
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

  const onVersionDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    const dragVersionId = parseInt(draggableId.match(/\d+/)![0], 10);
    const versionsCopy = roadmapsVersionsLocal!
      .map((ver) => {
        if (ver.sortingRank > source.index) {
          return { ...ver, sortingRank: ver.sortingRank - 1 };
        }
        return ver;
      })
      .map((ver) => {
        if (ver.id === dragVersionId) {
          return { ...ver, sortingRank: destination!.index };
        }
        if (ver.sortingRank >= destination!.index) {
          return { ...ver, sortingRank: ver.sortingRank + 1 };
        }
        return ver;
      })
      .sort((a, b) => a.sortingRank - b.sortingRank);
    setRoadmapsVersionsLocal(versionsCopy);
    dispatch(
      versionsActions.patchVersion({
        id: dragVersionId,
        sortingRank: destination!.index,
      }),
    ).then(() => {
      setDisableDrag(false);
    });
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

    if (result.type === 'TASKS') {
      await onTaskDragEnd(result);
    } else if (result.type === 'VERSIONS') {
      await onVersionDragEnd(result);
    }
  };
  const renderMilestones = () => {
    return (
      <>
        <Droppable
          droppableId="roadmapVersions"
          type="VERSIONS"
          direction="horizontal"
        >
          {(droppableProvided) => (
            <LayoutRow
              ref={droppableProvided.innerRef}
              overflowY="auto"
              overflowX="auto"
            >
              {roadmapsVersionsLocal!.map((version, index) => {
                return (
                  <Draggable
                    key={`ver-${version.id}`}
                    draggableId={`ver-${version.id}`}
                    index={index}
                    isDragDisabled={disableDrag}
                  >
                    {(draggableProvided) => (
                      <MilestoneCol
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                      >
                        <MilestoneWrapper>
                          <MilestoneHeader
                            {...draggableProvided.dragHandleProps}
                          >
                            {version.name}
                          </MilestoneHeader>

                          <SortableListWrapper>
                            <SortableTaskList
                              listId={`${version.id}`}
                              tasks={versionLists[version.id] || []}
                              disableDragging={disableDrag}
                            />
                          </SortableListWrapper>
                          <MilestoneFooter>
                            <DeleteButton
                              onClick={() => deleteVersion(version.id)}
                            />
                          </MilestoneFooter>
                        </MilestoneWrapper>
                      </MilestoneCol>
                    )}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </LayoutRow>
          )}
        </Droppable>
      </>
    );
  };

  return (
    <>
      <Toolbar>
        <AddVersionWrapper onClick={addVersion}>
          <span>
            <PlusIcon />
            <Trans i18nKey="Add new" />
          </span>
        </AddVersionWrapper>
      </Toolbar>
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <LayoutRow overflowY="auto" overflowX="auto">
          <UnassignedTasksCol>
            <UnassignedTasksWrapper>
              <UnassignedTasksHeader>
                <Trans i18nKey="Unassigned tasks" />
              </UnassignedTasksHeader>
              <SortableListWrapper>
                <SortableTaskList
                  listId={ROADMAP_LIST_ID}
                  tasks={versionLists[ROADMAP_LIST_ID] || []}
                  disableDragging={disableDrag}
                />
              </SortableListWrapper>
            </UnassignedTasksWrapper>
          </UnassignedTasksCol>
          {roadmapsVersionsLocal && renderMilestones()}
        </LayoutRow>
      </DragDropContext>
    </>
  );
};
