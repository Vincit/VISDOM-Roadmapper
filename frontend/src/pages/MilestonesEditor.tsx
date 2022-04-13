import { MouseEvent, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Link } from 'react-router-dom';
import {
  DeleteButton,
  DoneButton,
  SettingsButton,
} from '../components/forms/SvgButton';
import { SortableTaskList } from '../components/SortableTaskList';
import { ExpandableColumn } from '../components/ExpandableColumn';
import { MilestoneRatingsSummary } from '../components/MilestoneRatingsSummary';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from '../components/modals/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Task, Version } from '../redux/roadmaps/types';
import {
  weightedTaskPriority,
  hasRatingsOnEachDimension,
  isCompletedMilestone,
} from '../utils/TaskUtils';
import { sortKeyNumeric, sort, SortingOrders } from '../utils/SortUtils';
import { move } from '../utils/array';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './MilestonesEditor.module.scss';
import { apiV2 } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { userRoleSelector } from '../redux/user/selectors';

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
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const [
    patchVersion,
    { isLoading: disableDrag, isError },
  ] = apiV2.usePatchVersionMutation();
  const type = useSelector(userRoleSelector, shallowEqual);
  const hasVersionEditPermission = hasPermission(type, Permission.VersionEdit);
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
    {
      skip: !hasPermission(type, Permission.VersionRead),
    },
  );
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const [versionLists, setVersionLists] = useState<VersionListsObject>({});
  const [expandUnordered, setExpandUnordered] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading || !versionLists[ROADMAP_LIST_ID]) return;
    setIsLoading(false);
    if (!versionLists[ROADMAP_LIST_ID].length) setExpandUnordered(false);
  }, [isLoading, versionLists]);

  useEffect(() => {
    if (!roadmapsVersions) return;

    const newVersionLists: VersionListsObject = {};
    const ratedTasks = new Map(
      tasks?.filter(hasRatingsOnEachDimension).map((task) => [task.id, task]),
    );

    roadmapsVersions.forEach((version) => {
      newVersionLists[version.id] = version.tasks;
      version.tasks.forEach((task) => ratedTasks.delete(task.id));
    });

    newVersionLists[ROADMAP_LIST_ID] = sort(
      sortKeyNumeric(weightedTaskPriority(customers)),
      SortingOrders.DESCENDING,
    )(Array.from(ratedTasks.values()));

    setVersionLists(newVersionLists);
  }, [customers, tasks, roadmapsVersions, isError]);

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
    if (!roadmapId) return;
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.DELETE_VERSION_MODAL,
        modalProps: { id, roadmapId },
      }),
    );
  };

  const editOrCompleteVersionClicked = (
    id: number,
    name: string,
    modalType:
      | ModalTypes.EDIT_VERSION_MODAL
      | ModalTypes.COMPLETE_VERSION_MODAL,
  ) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType,
        modalProps: { id, name },
      }),
    );
  };

  const versionPayload = (versions?: Version[], id?: number) => {
    const version = versions?.find((ver) => ver.id === id);
    if (!version) throw new Error('Version not found!');
    return {
      ...version,
      tasks: version.tasks.map((task) => task.id),
    };
  };

  const onDragReorder = async (result: DropWithDestination) => {
    if (!roadmapId) return;
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    const list = copyLists[source.droppableId];
    move().from(list, source.index).to(list, destination.index);

    setVersionLists(copyLists);
    if (destination.droppableId !== ROADMAP_LIST_ID) {
      await patchVersion({
        roadmapId,
        id: +source.droppableId,
        tasks: copyLists[source.droppableId].map((task) => task.id),
      }).unwrap();
    }
  };

  const onDragMoveToList = async (result: DropWithDestination) => {
    const { source, destination } = result;
    const copyLists = copyVersionLists(versionLists);

    move()
      .from(copyLists[source.droppableId], source.index)
      .to(copyLists[destination.droppableId], destination.index);
    setVersionLists(copyLists);

    if (destination.droppableId === ROADMAP_LIST_ID) {
      // If moving to unversioned-list, just remove it from source version
      const payload = versionPayload(roadmapsVersions, +source.droppableId);
      payload.tasks = payload.tasks.filter(
        (taskId) => taskId !== +result.draggableId,
      );
      await patchVersion(payload).unwrap();
    } else {
      // If moving to another version -> add to new version
      // Backend deletes tasks from previous version automatically
      const payload = versionPayload(
        roadmapsVersions,
        +destination.droppableId,
      );
      payload.tasks.splice(destination.index, 0, +result.draggableId);
      await patchVersion(payload).unwrap();
    }
  };

  const onTaskDragEnd = async (result: DropWithDestination) => {
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) {
      await onDragReorder(result);
    } else {
      await onDragMoveToList(result);
    }
  };

  const onVersionDragEnd = async (result: DropWithDestination) => {
    if (!roadmapId || roadmapsVersions === undefined) return;
    const { source, destination, draggableId } = result;
    const dragVersionId = parseInt(draggableId.match(/\d+/)![0], 10);
    const versionsCopy = roadmapsVersions
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
    const versionTasks = versionsCopy[destination.index].tasks.map(
      (task) => task.id,
    );
    await patchVersion({
      roadmapId,
      id: dragVersionId,
      sortingRank: destination.index,
      tasks: versionTasks,
    }).unwrap();
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // Ignore drag if dropping in same position
    if (
      !destination ||
      (source.index === destination.index &&
        source.droppableId === destination.droppableId)
    ) {
      return;
    }

    if (result.type === 'TASKS') {
      await onTaskDragEnd(result as DropWithDestination);
    } else if (result.type === 'VERSIONS') {
      await onVersionDragEnd(result as DropWithDestination);
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
            { 'loading-cursor': disableDrag },
          )}
          ref={droppableProvided.innerRef}
        >
          {roadmapsVersions?.map((version, index) => {
            const completed = isCompletedMilestone(version);
            return (
              <Draggable
                key={`ver-${version.id}`}
                draggableId={`ver-${version.id}`}
                index={index}
                isDragDisabled={disableDrag || !hasVersionEditPermission}
              >
                {(draggableProvided) => (
                  <div
                    className={classes(css.milestoneCol)}
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                  >
                    <div
                      className={classes(css.milestoneWrapper, {
                        [css.completed]: completed,
                      })}
                    >
                      <div
                        className={classes(css.milestoneHeader)}
                        {...draggableProvided.dragHandleProps}
                      >
                        {version.name}
                      </div>
                      {versionLists[version.id]?.length === 0 ? (
                        <Droppable droppableId={`${version.id}`} type="TASKS">
                          {(provided, snapshot) => (
                            <div
                              className={classes(css.instructions, {
                                [css.highlight]: snapshot.isDraggingOver,
                              })}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              <div className={classes(css.text)}>
                                {hasVersionEditPermission && (
                                  <Trans i18nKey="Milestone task instructions" />
                                )}
                              </div>
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      ) : (
                        <SortableTaskList
                          listId={`${version.id}`}
                          tasks={versionLists[version.id] || []}
                          className={classes(css.milestoneTasks)}
                          disableDragging={
                            disableDrag || !hasVersionEditPermission
                          }
                          hideDragIndicator={!hasVersionEditPermission}
                        />
                      )}
                      <div className={classes(css.ratingsSummaryWrapper)}>
                        <MilestoneRatingsSummary
                          tasks={versionLists[version.id] || []}
                          completed={completed}
                        />
                      </div>
                      {hasVersionEditPermission && (
                        <div className={classes(css.milestoneFooter)}>
                          <DeleteButton
                            onClick={deleteVersionClicked(version.id)}
                            href={modalLink(ModalTypes.DELETE_VERSION_MODAL, {
                              id: version.id,
                              roadmapId: roadmapId!,
                            })}
                            disabled={disableDrag}
                          />
                          <SettingsButton
                            onClick={editOrCompleteVersionClicked(
                              version.id,
                              version.name,
                              ModalTypes.EDIT_VERSION_MODAL,
                            )}
                            href={modalLink(ModalTypes.EDIT_VERSION_MODAL, {
                              id: version.id,
                              name: version.name,
                            })}
                            disabled={disableDrag}
                          />
                          {!completed && (
                            <DoneButton
                              onClick={editOrCompleteVersionClicked(
                                version.id,
                                version.name,
                                ModalTypes.COMPLETE_VERSION_MODAL,
                              )}
                              href={modalLink(
                                ModalTypes.COMPLETE_VERSION_MODAL,
                                {
                                  id: version.id,
                                  name: version.name,
                                },
                              )}
                              disabled={disableDrag}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            );
          })}
          {hasVersionEditPermission && (
            <div className={classes(css.milestoneCol)}>
              <div
                className={classes(css.milestoneWrapper, css.addNewBtnWrapper)}
              >
                <button
                  className={classes(css['button-large'])}
                  type="button"
                  onClick={addVersion}
                  disabled={disableDrag}
                >
                  <Trans i18nKey="+ Add new milestone" />
                </button>
              </div>
            </div>
          )}
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );

  if (isLoading)
    return (
      <div className={classes(css.loadingSpinnerContainer)}>
        <LoadingSpinner />
      </div>
    );
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <InfoTooltip
        title={
          <div>
            <Trans i18nKey="Planner milestones tooltip">
              Milestones create your project’s
              <Link to={`/roadmap/${roadmapId}/planner/graph`}>roadmap.</Link>
            </Trans>
          </div>
        }
      >
        <div className={classes(css.infoBackground)}>
          <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
        </div>
      </InfoTooltip>
      <div className={classes(css.layoutRow, css.overflowYAuto)}>
        <ExpandableColumn
          className={classes(css.unorderedCol)}
          expanded={expandUnordered}
          onToggle={() => setExpandUnordered((prev) => !prev)}
          title={
            <div>
              {`${t('Unordered tasks')} (${
                versionLists[ROADMAP_LIST_ID]?.length ?? 0
              })`}
            </div>
          }
        >
          <SortableTaskList
            listId={ROADMAP_LIST_ID}
            tasks={versionLists[ROADMAP_LIST_ID] || []}
            disableDragging={disableDrag || !hasVersionEditPermission}
            className={classes({ 'loading-cursor': disableDrag })}
            hideDragIndicator={!hasVersionEditPermission}
            showRatings
            showSearch
          />
        </ExpandableColumn>
        {versionLists && renderMilestones()}
      </div>
    </DragDropContext>
  );
};
