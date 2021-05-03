import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { DeleteButton } from '../components/forms/DeleteButton';
import { SortableTaskList } from '../components/SortableTaskList';
import { MilestoneRatingsSummary } from '../components/MilestoneRatingsSummary';
import { ReactComponent as ExpandLess } from '../icons/expand_less.svg';
import { ReactComponent as ExpandMore } from '../icons/expand_more.svg';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import {
  allTasksSelector,
  chosenRoadmapSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import { PublicUser, Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { versionsActions } from '../redux/versions';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import {
  calcWeightedTaskPriority,
  dragDropBetweenLists,
  reorderList,
} from '../utils/TaskUtils';
import css from './MilestonesEditor.module.scss';

const classes = classNames.bind(css);

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
  const { t } = useTranslation();
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
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
  const [expandUnordered, setExpandUnordered] = useState(true);
  const [unversionedTasks, setUnversionedTasks] = useState<Task[]>();

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
      const unversioned = new Map(tasks.map((task) => [task.id, task]));
      roadmapsVersionsLocal.forEach((v) => {
        newVersionLists[v.id] = v.tasks;
        v.tasks.forEach((task) => unversioned.delete(task.id));
      });
      setUnversionedTasks(Array.from(unversioned.values()));
      newVersionLists[ROADMAP_LIST_ID] = Array.from(unversioned.values());

      newVersionLists[ROADMAP_LIST_ID].sort(
        (a, b) =>
          calcWeightedTaskPriority(b, publicUsers!, currentRoadmap) -
          calcWeightedTaskPriority(a, publicUsers!, currentRoadmap),
      );

      setVersionLists(newVersionLists);
    }
  }, [
    dispatch,
    roadmapsVersionsLocal,
    tasks,
    disableUpdates,
    publicUsers,
    currentRoadmap,
  ]);

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
            <div
              className={classes(
                css.layoutRow,
                css.overflowYAuto,
                css.horizontalScroller,
              )}
              ref={droppableProvided.innerRef}
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
                      <div
                        className={classes(css.layoutCol, css.milestoneCol)}
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                      >
                        <div className={classes(css.milestoneWrapper)}>
                          <div
                            className={classes(css.milestoneHeader)}
                            {...draggableProvided.dragHandleProps}
                          >
                            {version.name}
                          </div>

                          <div
                            className={classes(
                              css.sortableListWrapper,
                              css.milestone,
                            )}
                          >
                            <SortableTaskList
                              listId={`${version.id}`}
                              tasks={versionLists[version.id] || []}
                              disableDragging={disableDrag}
                            />
                          </div>
                          <div className={classes(css.ratingsSummaryWrapper)}>
                            <MilestoneRatingsSummary
                              tasks={versionLists[version.id] || []}
                            />
                          </div>
                          <div className={classes(css.milestoneFooter)}>
                            <DeleteButton
                              type="filled"
                              onClick={() => deleteVersion(version.id)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              <div className={classes(css.layoutCol, css.milestoneCol)}>
                <div
                  className={classes(
                    css.milestoneWrapper,
                    css.addNewBtnWrapper,
                  )}
                  onClick={addVersion}
                  onKeyPress={addVersion}
                  role="button"
                  tabIndex={0}
                >
                  <button
                    className={classes(css['button-large'])}
                    type="submit"
                  >
                    <Trans i18nKey="+ Add new milestone" />
                  </button>
                </div>
              </div>
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </>
    );
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div className={classes(css.layoutRow, css.overflowYAuto)}>
          <div
            className={classes(css.layoutCol, css.unorderedTasksCol, {
              [css.minimized]: !expandUnordered,
            })}
          >
            <div
              className={classes(css.unorderedTasksWrapper, {
                [css.minimized]: !expandUnordered,
              })}
            >
              <div
                className={classes(css.unorderedTasksHeader, {
                  [css.minimized]: !expandUnordered,
                })}
                onClick={() => setExpandUnordered(!expandUnordered)}
                onKeyPress={() => setExpandUnordered(!expandUnordered)}
                role="button"
                tabIndex={0}
              >
                {expandUnordered ? <ExpandLess /> : <ExpandMore />}
                <div>
                  {`${t('Unordered tasks')} (${unversionedTasks?.length})`}
                </div>
              </div>
              {expandUnordered && (
                <div className={classes(css.sortableListWrapper)}>
                  <SortableTaskList
                    listId={ROADMAP_LIST_ID}
                    tasks={versionLists[ROADMAP_LIST_ID] || []}
                    disableDragging={disableDrag}
                  />
                </div>
              )}
            </div>
          </div>
          {roadmapsVersionsLocal && renderMilestones()}
        </div>
      </DragDropContext>
    </>
  );
};
