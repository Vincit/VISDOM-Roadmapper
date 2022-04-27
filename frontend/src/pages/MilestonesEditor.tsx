/* eslint-disable no-param-reassign */
import { MouseEvent, KeyboardEvent, useEffect, useState } from 'react';
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
import DoneAll from '@mui/icons-material/DoneAll';
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
import { Task, Version, TaskRelation } from '../redux/roadmaps/types';
import {
  weightedTaskPriority,
  hasRatingsOnEachDimension,
  isCompletedMilestone,
} from '../utils/TaskUtils';
import {
  checkBadRelations,
  RelationAnnotation,
  TaskRelationTableType,
} from '../utils/TaskRelationUtils';
import { sortKeyNumeric, sort, SortingOrders } from '../utils/SortUtils';
import { move, partition } from '../utils/array';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './MilestonesEditor.module.scss';
import { apiV2 } from '../api/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Permission,
  TaskRelationType,
} from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { userRoleSelector } from '../redux/user/selectors';
import { MilestonesAmountSummary } from '../components/MilestonesAmountSummary';
import { CustomerWeightsVisualization } from '../components/CustomerWeightsVisualization';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { CustomerStakesScore } from '../components/CustomerStakesScore';
import { paths } from '../routers/paths';

const classes = classNames.bind(css);

type DropWithDestination = DropResult & {
  destination: NonNullable<DropResult['destination']>;
};

interface VersionListsObject {
  [K: string]: (Task & RelationAnnotation)[];
}

const markRelations = (relations: TaskRelation[], out: VersionListsObject) => (
  task: VersionListsObject[string][number],
) => {
  const [deps, syns] = partition(
    relations.filter(({ from, to }) => from === task.id || to === task.id),
    (r) => r.type === TaskRelationType.Dependency,
  );
  const contributes = new Set(syns.flatMap(({ from, to }) => [from, to]));

  const [before, after] = partition(deps, ({ to }) => to === task.id);
  const precedes = new Set(after.map(({ to }) => to));
  const requires = new Set(before.map(({ from }) => from));

  Object.values(out).forEach((list) => {
    list.forEach((x) => {
      if (x.id === task.id) return;
      if (x.relation === undefined) {
        x.relation = null;
      }
      if (x.relation === null && contributes.has(x.id)) {
        x.relation = TaskRelationTableType.Contributes;
      }
      if (x.relation !== TaskRelationTableType.Requires && precedes.has(x.id)) {
        x.relation = TaskRelationTableType.Precedes;
      }
      if (requires.has(x.id)) {
        x.relation = TaskRelationTableType.Requires;
      }
    });
  });
};

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
  const role = useSelector(userRoleSelector, shallowEqual);
  const hasVersionEditPermission = hasPermission(role, Permission.VersionEdit);
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
    {
      skip: !hasPermission(role, Permission.VersionRead),
    },
  );
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const { data: relations } = apiV2.useGetTaskRelationsQuery(
    roadmapId ?? skipToken,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const [versionLists, setVersionLists] = useState<VersionListsObject>({});
  const [expandUnordered, setExpandUnordered] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);

  const versionsSelected = selectedVersions.length > 0;
  const visualizedVersions =
    (versionsSelected
      ? roadmapsVersions?.filter(({ id }) => selectedVersions.includes(id))
      : roadmapsVersions) || [];

  useEffect(() => {
    if (!isLoading || !versionLists[ROADMAP_LIST_ID]) return;
    setIsLoading(false);
    if (!versionLists[ROADMAP_LIST_ID].length) setExpandUnordered(false);
  }, [isLoading, versionLists]);

  useEffect(() => {
    if (!roadmapsVersions) return;

    const newVersionLists: { [k: string]: Task[] } = {};
    const ratedTasks = new Map(
      tasks?.filter(hasRatingsOnEachDimension).map((task) => [task.id, task]),
    );
    const tasksById = new Map(ratedTasks);

    roadmapsVersions.forEach((version) => {
      newVersionLists[version.id] = version.tasks;
      version.tasks.forEach((task) => ratedTasks.delete(task.id));
    });

    newVersionLists[ROADMAP_LIST_ID] = sort(
      sortKeyNumeric(weightedTaskPriority(customers)),
      SortingOrders.DESCENDING,
    )(Array.from(ratedTasks.values()));

    const ids = [ROADMAP_LIST_ID, ...roadmapsVersions.map(({ id }) => `${id}`)];
    const result: VersionListsObject = {};
    checkBadRelations(
      ids.map((key) => newVersionLists[key].map(({ id }) => id)),
      relations ?? [],
    ).forEach((check, index) => {
      result[ids[index]] = check.map(({ id, ...rest }) => ({
        ...tasksById.get(id)!,
        ...rest,
      }));
    });
    setVersionLists(result);
  }, [customers, tasks, roadmapsVersions, isError, relations]);

  const addVersion = (e: MouseEvent) => {
    e.stopPropagation();
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
    setIsDragging(false);
    const { source, destination, type } = result;
    const copy = copyVersionLists(versionLists);
    Object.values(copy).forEach((list) =>
      list.forEach((x) => {
        x.relation = undefined;
      }),
    );
    setVersionLists(copy);

    // Ignore drag if dropping in same position
    if (
      !destination ||
      (source.index === destination.index &&
        source.droppableId === destination.droppableId)
    ) {
      return;
    }

    if (type === 'TASKS') {
      await onTaskDragEnd(result as DropWithDestination);
    } else if (type === 'VERSIONS') {
      await onVersionDragEnd(result as DropWithDestination);
    }
  };

  const selectVersions = (e: MouseEvent | KeyboardEvent, id: number) => {
    e.stopPropagation();
    const containsClicked = selectedVersions.includes(id);
    if (e.ctrlKey || e.metaKey) {
      if (containsClicked)
        setSelectedVersions(selectedVersions.filter((num) => num !== id));
      else setSelectedVersions([...selectedVersions, id]);
      return;
    }
    if (containsClicked && selectedVersions.length === 1)
      setSelectedVersions([]);
    else setSelectedVersions([id]);
  };

  const renderTopBar = () => {
    return (
      <div className={classes(css.topbar)}>
        <div className={classes(css.topbarShares)}>
          <div>
            <Trans i18nKey="Actual weighted shares" />
          </div>
          {roadmapsVersions && (
            <TaskValueCreatedVisualization
              versions={visualizedVersions}
              width={200}
              height={20}
              barWidth={20}
            />
          )}
        </div>
        <div className={classes(css.topbarShares)}>
          <Trans i18nKey="Target weighted shares" />
          {roadmapsVersions && (
            <CustomerWeightsVisualization
              width={200}
              height={20}
              barWidth={20}
              light
            />
          )}
        </div>
        {roadmapsVersions && (
          <Link
            className={classes(css.clientWeightsLink, 'green')}
            to={`/roadmap/${roadmapId}${paths.roadmapRelative.planner}${paths.plannerRelative.weights}`}
          >
            <Trans i18nKey="See client weights" />
          </Link>
        )}
        <div className={classes(css.topbarRightSide)}>
          <MilestonesAmountSummary
            selected={versionsSelected}
            versions={visualizedVersions}
          />
          <InfoTooltip
            title={
              <div>
                <Trans i18nKey="Planner milestones tooltip">
                  Milestones create your project’s
                  <Link to={`/roadmap/${roadmapId}/planner/graph`}>
                    roadmap.
                  </Link>
                </Trans>
              </div>
            }
          >
            <div className={classes(css.infoBackground)}>
              <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
            </div>
          </InfoTooltip>
        </div>
      </div>
    );
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
          role="button"
          tabIndex={0}
          onClick={() => setSelectedVersions([])}
          onKeyPress={() => setSelectedVersions([])}
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
                      role="button"
                      tabIndex={0}
                      onClick={(e) => selectVersions(e, version.id)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') selectVersions(e, version.id);
                      }}
                      className={classes(css.milestoneWrapper, {
                        [css.dragging]: isDragging,
                        [css.completed]: completed,
                        [css.selected]: selectedVersions.includes(version.id),
                      })}
                    >
                      <div
                        className={classes(css.milestoneHeader)}
                        {...draggableProvided.dragHandleProps}
                      >
                        {completed && <DoneAll />}
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
                      <div
                        className={classes(css.summaryWrapper, {
                          [css.completed]: completed,
                        })}
                      >
                        <CustomerStakesScore
                          version={version}
                          completed={completed}
                        />
                      </div>
                      <div className={classes(css.summaryWrapper)}>
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
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={({ type, source: { droppableId, index } }) => {
        setIsDragging(true);
        setSelectedVersions([]);
        if (!roadmapsVersions || !relations) return;
        const copy = copyVersionLists(versionLists);
        if (type === 'TASKS') {
          const task = versionLists[droppableId][index];
          markRelations(relations, copy)(task);
          task.relation = null;
        } else if (type === 'VERSIONS') {
          const { id } = roadmapsVersions[index];
          versionLists[id].forEach(markRelations(relations, copy));
          versionLists[id].forEach((x) => {
            x.relation = null;
          });
        }
        setVersionLists(copy);
      }}
    >
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
        <div className={classes(css.layoutCol, css.overflowYAuto)}>
          {renderTopBar()}
          <div className={classes(css.layoutRow, css.overflowYAuto)}>
            {versionLists && renderMilestones()}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};
