import { MouseEvent, useEffect, useState } from 'react';
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
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap, Task, Version } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  not,
  weightedTaskPriority,
  hasMissingRatings,
} from '../utils/TaskUtils';
import { sortKeyNumeric, sort } from '../utils/SortUtils';
import { move } from '../utils/array';
import css from './MilestonesEditor.module.scss';

const classes = classNames.bind(css);

type DropWithDestination = DropResult & {
  destination: NonNullable<DropResult['destination']>;
};

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
  const roadmapsVersions = currentRoadmap?.versions;
  const [roadmapsVersionsLocal, setRoadmapsVersionsLocal] = useState<
    undefined | Version[]
  >(undefined);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
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

  useEffect(() => {
    if (!roadmapsVersionsLocal && currentRoadmap)
      dispatch(roadmapsActions.getVersions(currentRoadmap.id));
  }, [currentRoadmap, dispatch, roadmapsVersionsLocal]);

  useEffect(() => {
    if (disableUpdates) return;
    if (roadmapsVersionsLocal === undefined) return;
    const newVersionLists: VersionListsObject = {};
    const unversioned = new Map(
      tasks
        .filter(not(hasMissingRatings(currentRoadmap)))
        .map((task) => [task.id, task]),
    );
    roadmapsVersionsLocal.forEach((v) => {
      newVersionLists[v.id] = v.tasks;
      v.tasks.forEach((task) => unversioned.delete(task.id));
    });
    newVersionLists[ROADMAP_LIST_ID] = sort(
      sortKeyNumeric(weightedTaskPriority(currentRoadmap)),
    )(Array.from(unversioned.values()));

    setVersionLists(newVersionLists);
  }, [
    dispatch,
    roadmapsVersionsLocal,
    tasks,
    disableUpdates,
    customers,
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

  const deleteVersionClicked = (id: number) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.DELETE_VERSION_MODAL,
        modalProps: { id, roadmapId: currentRoadmap.id },
      }),
    );
  };

  const editVersionClicked = (id: number, name: string) => (e: MouseEvent) => {
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

  const onDragReorder = async (result: DropWithDestination) => {
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    const list = copyLists[source.droppableId];
    move().from(list, source.index).to(list, destination.index);

    setVersionLists(copyLists);
    if (destination.droppableId !== ROADMAP_LIST_ID) {
      await dispatch(
        roadmapsActions.patchVersion({
          id: +source.droppableId,
          tasks: copyLists[source.droppableId].map((task) => task.id),
        }),
      ).unwrap();
    }
  };

  const onDragMoveToList = async (result: DropWithDestination) => {
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    move()
      .from(copyLists[source.droppableId], source.index)
      .to(copyLists[destination.droppableId], destination.index);
    setVersionLists(copyLists);

    if (destination.droppableId !== ROADMAP_LIST_ID) {
      // If moving to another version -> add to new version
      await dispatch(
        roadmapsActions.addTaskToVersion({
          version: { id: +destination.droppableId },
          task: {
            id: +result.draggableId,
          },
          index: destination.index,
        }),
      ).unwrap();
    }

    if (source.droppableId !== ROADMAP_LIST_ID) {
      // If moving from another version -> remove from previous version
      await dispatch(
        roadmapsActions.removeTaskFromVersion({
          version: { id: +source.droppableId },
          task: {
            id: +result.draggableId,
          },
        }),
      ).unwrap();
    }
  };

  const onTaskDragEnd = async (result: DropWithDestination) => {
    const { source, destination } = result;

    // Backup list that is not mutated, used for reverting action if api request fails
    const backupLists = copyVersionLists(versionLists);
    try {
      if (source.droppableId === destination.droppableId) {
        await onDragReorder(result);
      } else {
        try {
          setDisableUpdates(true);
          await onDragMoveToList(result);
        } finally {
          setDisableUpdates(false);
        }
      }
    } catch (e) {
      setVersionLists(backupLists);
    }
  };

  const onVersionDragEnd = async (result: DropWithDestination) => {
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
          return { ...ver, sortingRank: destination.index };
        }
        if (ver.sortingRank >= destination.index) {
          return { ...ver, sortingRank: ver.sortingRank + 1 };
        }
        return ver;
      })
      .sort((a, b) => a.sortingRank - b.sortingRank);
    setRoadmapsVersionsLocal(versionsCopy);
    const versionTasks = versionsCopy[destination.index].tasks.map(
      (task) => task.id,
    );
    await dispatch(
      roadmapsActions.patchVersion({
        id: dragVersionId,
        sortingRank: destination.index,
        tasks: versionTasks,
      }),
    );
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

    try {
      if (result.type === 'TASKS') {
        await onTaskDragEnd(result as DropWithDestination);
      } else if (result.type === 'VERSIONS') {
        await onVersionDragEnd(result as DropWithDestination);
      }
    } finally {
      setDisableDrag(false);
    }
  };
  const renderMilestones = () => (
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
          {roadmapsVersionsLocal!.map((version, index) => (
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
                        onClick={deleteVersionClicked(version.id)}
                        href={modalLink(ModalTypes.DELETE_VERSION_MODAL, {
                          id: version.id,
                          roadmapId: currentRoadmap.id,
                        })}
                      />
                      <SettingsButton
                        onClick={editVersionClicked(version.id, version.name)}
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
          ))}
          <div className={classes(css.layoutCol, css.milestoneCol)}>
            <div
              className={classes(css.milestoneWrapper, css.addNewBtnWrapper)}
              onClick={addVersion}
              onKeyPress={addVersion}
              role="button"
              tabIndex={0}
            >
              <button className={classes(css['button-large'])} type="submit">
                <Trans i18nKey="+ Add new milestone" />
              </button>
            </div>
          </div>
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
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
  );
};
