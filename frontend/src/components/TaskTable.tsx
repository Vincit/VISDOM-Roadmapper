/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { TableUnratedTaskRow } from './TableUnratedTaskRow';
import { Roadmap, RoadmapUser, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import {
  filterTasks,
  FilterTypes,
  SortingOrders,
  SortingTypes,
  sortTasks,
  tasksThatRequireRating,
} from '../utils/TaskUtils';
import css from './TaskTable.module.scss';
import { TableRatedTaskRow } from './TableRatedTaskRow';
import {
  chosenRoadmapSelector,
  roadmapUsersSelector,
} from '../redux/roadmaps/selectors';

const classes = classNames.bind(css);

interface TableHeader {
  label: string;
  sorting: SortingTypes;
  textAlign?: 'end' | 'left' | 'center';
  width?: string;
}

const TaskTable: React.FC<{
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
  tableHeaders: TableHeader[];
  label: string;
  TaskRow: any;
}> = ({ tasks, searchString, searchFilter, tableHeaders, label, TaskRow }) => {
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const getRenderTaskList: () => Task[] = () => {
    // Filter, search, sort tasks
    const filtered = filterTasks(
      tasks,
      searchFilter || FilterTypes.SHOW_ALL, // Show all tasks if component didn't receive searchFilter as props
      userInfo?.id,
    );
    const searched = filtered.filter(
      (task) =>
        task.name.toLowerCase().includes(searchString || '') ||
        task.description.toLowerCase().includes(searchString || ''),
    );
    const sorted = sortTasks(searched, sortingType, sortingOrder);

    return sorted;
  };

  const toggleSortOrder = () => {
    if (sortingOrder === SortingOrders.ASCENDING) {
      setSortingOrder(SortingOrders.DESCENDING);
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
  };

  const onSortingChange = (sorter: SortingTypes) => {
    if (sorter === sortingType) {
      toggleSortOrder();
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
    setSortingType(sorter);
  };

  const renderSortingArrow = () => {
    return sortingOrder === SortingOrders.ASCENDING ? (
      <ArrowUpCircle />
    ) : (
      <ArrowDownCircle />
    );
  };

  const renderUnratedTasks = () => {
    return (
      <table className={classes(css.styledTable)}>
        <thead>
          <tr className={classes(css.styledTr)}>
            {tableHeaders.map((header) => (
              <th
                className={classes(css.styledTh, css.clickable, {
                  textAlignEnd: header.textAlign === 'end',
                  textAlignCenter: header.textAlign === 'center',
                })}
                key={header.label}
                onClick={() => onSortingChange(header.sorting)}
                style={{ width: header.width }}
              >
                <span className="headerSpan">
                  <Trans i18nKey={header.label} />
                  {sortingType === header.sorting ? renderSortingArrow() : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getRenderTaskList().map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      {getRenderTaskList().length > 0 && (
        <div>
          <h2 className={classes(css.taskTableHeader)}>
            {label} ({getRenderTaskList().length})
          </h2>
          <div>
            <div>{getRenderTaskList().length && renderUnratedTasks()}</div>
          </div>
        </div>
      )}
    </>
  );
};

export const TaskTableUnrated: React.FC<{
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
}> = ({ tasks, searchString, searchFilter }) => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const [taskList, setTaskList] = useState<Task[] | undefined>([]);

  useEffect(() => {
    if (userInfo && currentRoadmap && allUsers)
      setTaskList(
        tasksThatRequireRating(tasks, allUsers, userInfo, currentRoadmap),
      );
  }, [allUsers, currentRoadmap, tasks, userInfo]);

  const tableHeaders: TableHeader[] = [
    {
      label: 'Status',
      sorting: SortingTypes.SORT_STATUS,
      textAlign: 'center',
      width: '1em',
    },
    { label: 'Title', sorting: SortingTypes.SORT_NAME },
    { label: 'Description', sorting: SortingTypes.SORT_DESC },
    { label: 'Waiting for ratings', sorting: SortingTypes.NO_SORT },
    {
      label: 'Rating',
      sorting: SortingTypes.SORT_RATINGS,
      width: '1em',
    },
    {
      label: 'Created on',
      sorting: SortingTypes.SORT_CREATEDAT,
      width: '8em',
    },
  ];

  return (
    <>
      <TaskTable
        tasks={taskList || []}
        searchString={searchString}
        searchFilter={searchFilter}
        tableHeaders={tableHeaders}
        label="Waiting for ratings"
        TaskRow={TableUnratedTaskRow}
      />
    </>
  );
};

export const TaskTableRated: React.FC<{
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
}> = ({ tasks, searchString, searchFilter }) => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [taskList, setTaskList] = useState<Task[] | undefined>([]);

  useEffect(() => {
    if (userInfo && currentRoadmap && allUsers)
      setTaskList(
        tasksThatRequireRating(tasks, allUsers, userInfo, currentRoadmap),
      );
  }, [allUsers, currentRoadmap, tasks, userInfo]);

  const getRemainingTasks: (passedTasks: Task[]) => Task[] = (
    passedTasks: Task[],
  ) => {
    return tasks.filter((task) => !passedTasks.includes(task));
  };

  const tableHeaders: TableHeader[] = [
    {
      label: 'Task title',
      sorting: SortingTypes.SORT_NAME,
      textAlign: 'center',
      width: '1em',
    },
    { label: 'Average value', sorting: SortingTypes.SORT_AVG_VALUE },
    { label: 'Average work', sorting: SortingTypes.SORT_AVG_WORK },
    { label: 'Total value', sorting: SortingTypes.SORT_TOTAL_VALUE },
    {
      label: 'Total work',
      sorting: SortingTypes.SORT_TOTAL_WORK,
      width: '1em',
    },
    { label: 'Status', sorting: SortingTypes.SORT_STATUS },
  ];

  return (
    <>
      <TaskTable
        tasks={getRemainingTasks(taskList || [])}
        searchString={searchString}
        searchFilter={searchFilter}
        tableHeaders={tableHeaders}
        label="Rated tasks"
        TaskRow={TableRatedTaskRow}
      />
    </>
  );
};
