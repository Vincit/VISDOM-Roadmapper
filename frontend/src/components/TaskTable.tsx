/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC, useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { TableUnratedTaskRow } from './TableUnratedTaskRow';
import { Roadmap, RoadmapUser, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { InfoTooltip } from './InfoTooltip';
import {
  filterTasks,
  FilterTypes,
  SortingOrders,
  SortingTypes,
  sortTasks,
  taskAwaitsRatings,
  unratedProductOwnerTasks,
} from '../utils/TaskUtils';
import { RoleType } from '../../../shared/types/customTypes';
import { getType } from '../utils/UserUtils';
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

const TaskTable: FC<{
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
  tableHeaders: TableHeader[];
  label: string;
  TaskRow: any;
}> = ({ tasks, searchString, searchFilter, tableHeaders, label, TaskRow }) => {
  const { t } = useTranslation();
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

  const renderTasks = () => {
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
          <div className={classes(css.titleContainer)}>
            <h2 className={classes(css.title)}>
              {label} ({getRenderTaskList().length})
            </h2>
            <InfoTooltip title={t('tooltipMessage')}>
              <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
            </InfoTooltip>
          </div>
          <div>{renderTasks()}</div>
        </div>
      )}
    </>
  );
};

export const TaskTableUnrated: FC<{
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
}> = ({ tasks, searchString, searchFilter }) => {
  const { t } = useTranslation();

  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const [taskList, setTaskList] = useState<Task[] | undefined>([]);

  useEffect(() => {
    const type = getType(userInfo?.roles, currentRoadmap?.id);
    if (type === RoleType.Admin) {
      if (userInfo && currentRoadmap && allUsers) {
        setTaskList(
          unratedProductOwnerTasks(
            tasks,
            allUsers,
            currentRoadmap.customers ?? [],
          ),
        );
      }
    }
    if (type === RoleType.Developer || type === RoleType.Business) {
      setTaskList(tasks.filter((task) => taskAwaitsRatings(task, userInfo)));
    }
  }, [allUsers, currentRoadmap, tasks, userInfo]);

  const tableHeaders: TableHeader[] = [
    { label: 'Task title', sorting: SortingTypes.SORT_NAME },
    { label: 'Current average value', sorting: SortingTypes.SORT_AVG_VALUE },
    { label: 'Current average work', sorting: SortingTypes.SORT_AVG_WORK },
    { label: 'Waiting for ratings', sorting: SortingTypes.NO_SORT },
  ];

  return (
    <TaskTable
      tasks={taskList || []}
      searchString={searchString}
      searchFilter={searchFilter}
      tableHeaders={tableHeaders}
      label={t('unratedTaskMessage')}
      TaskRow={TableUnratedTaskRow}
    />
  );
};

export const TaskTableRated: FC<{
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
}> = ({ tasks, searchString, searchFilter }) => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [taskList, setTaskList] = useState<Task[] | undefined>([]);

  useEffect(() => {
    const type = getType(userInfo?.roles, currentRoadmap?.id);
    if (type === RoleType.Admin) {
      if (userInfo && currentRoadmap && allUsers) {
        const unratedTasks = unratedProductOwnerTasks(
          tasks,
          allUsers,
          currentRoadmap.customers ?? [],
        );
        setTaskList(tasks.filter((task) => !unratedTasks.includes(task)));
      }
    }
    if (type === RoleType.Developer || type === RoleType.Business) {
      setTaskList(tasks.filter((task) => !taskAwaitsRatings(task, userInfo)));
    }
  }, [allUsers, currentRoadmap, tasks, userInfo]);

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
    <TaskTable
      tasks={taskList || []}
      searchString={searchString}
      searchFilter={searchFilter}
      tableHeaders={tableHeaders}
      label="Rated tasks"
      TaskRow={TableRatedTaskRow}
    />
  );
};
