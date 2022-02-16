import { MouseEvent, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { Link } from 'react-router-dom';
import { DeleteButton, SettingsButton } from '../components/forms/SvgButton';
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
} from '../utils/TaskUtils';
import { sortKeyNumeric, sort, SortingOrders } from '../utils/SortUtils';
import { move } from '../utils/array';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './MilestonesEditor.module.scss';
import { apiV2 } from '../api/api';

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
  const [patchVersion] = apiV2.usePatchVersionMutation();
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
  );
  const [roadmapsVersionsLocal, setRoadmapsVersionsLocal] = useState<
    undefined | Version[]
  >(undefined);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
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
    if (disableUpdates) return;
    if (roadmapsVersionsLocal === undefined) return;
    const newVersionLists: VersionListsObject = {};
    const unversioned = new Map(
      tasks?.filter(hasRatingsOnEachDimension).map((task) => [task.id, task]),
    );
    roadmapsVersionsLocal.forEach((v) => {
      newVersionLists[v.id] = v.tasks;
      v.tasks.forEach((task) => unversioned.delete(task.id));
    });
    newVersionLists[ROADMAP_LIST_ID] = sort(
      sortKeyNumeric(weightedTaskPriority(customers)),
      SortingOrders.DESCENDING,
    )(Array.from(unversioned.values()));

    setVersionLists(newVersionLists);
  }, [customers, disableUpdates, roadmapsVersionsLocal, tasks]);

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
    if (roadmapId === undefined) return;
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.DELETE_VERSION_MODAL,
        modalProps: { id, roadmapId },
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

  const versionPayload = (versions?: Version[], id?: number) => {
    const version = versions?.find((ver) => ver.id === id);
    if (!version) throw new Error('Version not found!');
    return {
      ...version,
      tasks: version.tasks.map((task) => task.id),
    };
  };

  const onDragReorder = async (result: DropWithDestination) => {
    if (roadmapId === undefined) return;
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

    if (destination.droppableId !== ROADMAP_LIST_ID) {
      // If moving to another version -> add to new version
      const payload = versionPayload(
        roadmapsVersions,
        +destination.droppableId,
      );
      payload.tasks.splice(destination.index, 0, +result.draggableId);
      await patchVersion(payload).unwrap();
    }

    if (source.droppableId !== ROADMAP_LIST_ID) {
      // If moving from another version -> remove from previous version
      const payload = versionPayload(roadmapsVersions, +source.droppableId);
      payload.tasks = payload.tasks.filter(
        (taskId) => taskId !== +result.draggableId,
      );
      await patchVersion(payload).unwrap();
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
    if (roadmapId === undefined || roadmapsVersionsLocal === undefined) return;
    const { source, destination, draggableId } = result;
    const dragVersionId = parseInt(draggableId.match(/\d+/)![0], 10);
    const versionsCopy = roadmapsVersionsLocal
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
                  className={classes(css.milestoneCol)}
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
                          roadmapId: roadmapId!,
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
          <div className={classes(css.milestoneCol)}>
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
          <div className={classes(css.sortableListWrapper)}>
            <SortableTaskList
              listId={ROADMAP_LIST_ID}
              tasks={versionLists[ROADMAP_LIST_ID] || []}
              disableDragging={disableDrag}
            />
          </div>
        </ExpandableColumn>
        {roadmapsVersionsLocal && renderMilestones()}
      </div>
    </DragDropContext>
  );
};
