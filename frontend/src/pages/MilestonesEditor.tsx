import { MouseEvent, useEffect, useState, useCallback } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { roadmapsActions } from '../redux/roadmaps';
import { RoleType } from '../../../shared/types/customTypes';
import { DeleteButton, SettingsButton } from '../components/forms/SvgButton';
import { SortableTaskList } from '../components/SortableTaskList';
import { MilestoneRatingsSummary } from '../components/MilestoneRatingsSummary';
import { ReactComponent as ExpandLess } from '../icons/expand_less.svg';
import { ReactComponent as ExpandMore } from '../icons/expand_more.svg';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from '../components/modals/types';
import {
  allTasksSelector,
  chosenRoadmapSelector,
  allCustomersSelector,
  roadmapUsersSelector,
  roadmapsVersionsSelector,
} from '../redux/roadmaps/selectors';
import {
  Customer,
  Roadmap,
  Task,
  RoadmapUser,
  Version,
} from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
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
    roadmapsVersionsSelector(),
    shallowEqual,
  );
  const [roadmapsVersionsLocal, setRoadmapsVersionsLocal] = useState<
    undefined | Version[]
  >(undefined);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const [versionLists, setVersionLists] = useState<VersionListsObject>({});
  const [disableUpdates, setDisableUpdates] = useState(false);
  const [disableDrag, setDisableDrag] = useState(false);
  const [expandUnordered, setExpandUnordered] = useState(true);

  useEffect(() => {
    // Keeping a local copy of versions so we can immediately update this state on drag&drop, then get backend updated state from redux later
    setRoadmapsVersionsLocal(roadmapsVersions);
  }, [roadmapsVersions]);

  // Checks if tasks in the tasks list have been given ratings, returns only tasks with ratings from everyone involved
  // TODO: check if available task util
  const checkRatings = useCallback(
    (uncheckedTasks: Task[]) => {
      const ratedTasks: Task[] = [];
      const developers = allUsers?.filter(
        (user) => user.type === RoleType.Developer,
      );
      uncheckedTasks.forEach((task) => {
        const allRatings = task.ratings.map((rating) => rating.createdByUser);

        const unratedByCustomer = customers?.some((customer) => {
          const representativeIds = customer.representatives?.map(
            (rep) => rep.id,
          );
          return !representativeIds?.every((rep) => allRatings.includes(rep));
        });

        const unratedByDeveloper = developers?.some(
          (developer) => !allRatings.includes(developer.id),
        );

        if (!unratedByCustomer && !unratedByDeveloper) ratedTasks.push(task);
      });
      return ratedTasks;
    },
    [allUsers, customers],
  );

  useEffect(() => {
    if (disableUpdates) return;
    if (roadmapsVersionsLocal === undefined) {
      dispatch(roadmapsActions.getVersions(currentRoadmap!.id));
    } else {
      const newVersionLists: VersionListsObject = {};
      const unversioned = new Map(
        checkRatings(tasks).map((task) => [task.id, task]),
      );
      roadmapsVersionsLocal.forEach((v) => {
        newVersionLists[v.id] = v.tasks;
        v.tasks.forEach((task) => unversioned.delete(task.id));
      });
      newVersionLists[ROADMAP_LIST_ID] = Array.from(unversioned.values());

      newVersionLists[ROADMAP_LIST_ID].sort(
        (a, b) =>
          calcWeightedTaskPriority(b, customers!, currentRoadmap) -
          calcWeightedTaskPriority(a, customers!, currentRoadmap),
      );

      setVersionLists(newVersionLists);
    }
  }, [
    dispatch,
    roadmapsVersionsLocal,
    tasks,
    disableUpdates,
    customers,
    currentRoadmap,
    checkRatings,
  ]);

  const addVersion = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_VERSION_MODAL,
        modalProps: {},
      }),
    );
  };

  const deleteVersionClicked = (e: MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.DELETE_VERSION_MODAL,
        modalProps: { id, roadmapId: currentRoadmap.id },
      }),
    );
  };

  const editVersionClicked = (e: MouseEvent, id: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_VERSION_MODAL,
        modalProps: { id, name },
      }),
    );
  };

  const onDragStart = () => {
    setDisableDrag(true);
  };

  const onDragReorder = async (result: DropResult) => {
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    // Reordering inside one list
    copyLists[source.droppableId] = reorderList(
      copyLists[source.droppableId],
      source.index,
      destination!.index,
    );

    setVersionLists(copyLists);
    if (destination?.droppableId === ROADMAP_LIST_ID) return Promise.resolve();

    const res = await dispatch(
      roadmapsActions.patchVersion({
        id: +source.droppableId,
        tasks: copyLists[source.droppableId].map((task) => task.id),
      }),
    );
    if (roadmapsActions.patchVersion.rejected.match(res)) {
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
        copyLists[source.droppableId],
        copyLists[destination!.droppableId],
        source,
        destination!,
      ),
    );
    setVersionLists(copyLists);

    setDisableUpdates(true);
    if (destination?.droppableId !== ROADMAP_LIST_ID) {
      // If moving to another version -> add to new version
      const addRes = await dispatch(
        roadmapsActions.addTaskToVersion({
          version: { id: +destination!.droppableId! },
          task: {
            id: +result.draggableId,
          },
          index: destination!.index,
        }),
      );
      if (roadmapsActions.addTaskToVersion.rejected.match(addRes)) {
        setDisableUpdates(false);
        return Promise.reject();
      }
    }

    if (source.droppableId !== ROADMAP_LIST_ID) {
      // If moving from another version -> remove from previous version
      const removeRes = await dispatch(
        roadmapsActions.removeTaskFromVersion({
          version: { id: +source!.droppableId! },
          task: {
            id: +result.draggableId,
          },
        }),
      );
      if (roadmapsActions.removeTaskFromVersion.rejected.match(removeRes)) {
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
    const versionTasks = versionsCopy[destination!.index].tasks.map(
      (task) => task.id,
    );
    dispatch(
      roadmapsActions.patchVersion({
        id: dragVersionId,
        sortingRank: destination!.index,
        tasks: versionTasks,
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
                              onClick={(e) =>
                                deleteVersionClicked(e, version.id)
                              }
                              href={modalLink(ModalTypes.DELETE_VERSION_MODAL, {
                                id: version.id,
                                roadmapId: currentRoadmap.id,
                              })}
                            />
                            <SettingsButton
                              onClick={(e) =>
                                editVersionClicked(e, version.id, version.name)
                              }
                              href={modalLink(ModalTypes.EDIT_VERSION_MODAL, {
                                id: version.id,
                                name: version.name,
                              })}
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
                  {`${t('Unordered tasks')} (${
                    versionLists[ROADMAP_LIST_ID]?.length ?? 0
                  })`}
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
