import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { Checkbox } from './forms/Checkbox';
import { TableTaskRow } from './TableTaskRow';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';
import { Task, Roadmap, Customer, RoadmapUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import {
  filterTasks,
  FilterTypes,
  SortingOrders,
  SortingTypes,
  sortTasks,
  taskAwaitsRatings,
} from '../utils/TaskUtils';
import { titleCase } from '../utils/string';
import { getType } from '../utils/UserUtils';
import css from './TaskTable.module.scss';
import {
  allCustomersSelector,
  roadmapUsersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';

const classes = classNames.bind(css);

interface TableHeader {
  label: string;
  sorting: SortingTypes;
  textAlign?: 'end' | 'left' | 'center';
  width?: string;
}

export const TaskTable: React.FC<{
  tasks: Task[];
  nofilter?: boolean;
  nosearch?: boolean;
}> = ({ tasks, nofilter, nosearch }) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [searchFilter, setSearchFilter] = useState(FilterTypes.SHOW_ALL);
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const allUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const allCustomers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  const getRenderTaskList: () => Task[] = () => {
    // Filter, search, sort tasks
    const filtered = filterTasks(tasks, searchFilter, userInfo?.id);
    const searched = filtered.filter(
      (task) =>
        task.name.toLowerCase().includes(searchString) ||
        task.description.toLowerCase().includes(searchString),
    );
    const sorted = sortTasks(searched, sortingType, sortingOrder);

    return sorted;
  };

  // Return tasks that don't have ratings from everyone involved in the task - View for product owner
  const getOwnerTask: () => Task[] = () => {
    const developers = allUsers?.filter(
      (user) => user.type === RoleType.Developer,
    );
    const unrated = getRenderTaskList().filter((task) => {
      const ratingIds = task.ratings.map((rating) => rating.createdByUser);

      const unratedCustomers = allCustomers?.filter((customer) => {
        const representativeIds = customer?.representatives?.map(
          (rep) => rep.id,
        );
        return !representativeIds?.every((id) => ratingIds?.includes(id));
      });

      const missingDevs = developers?.filter(
        (developer) => !ratingIds.includes(developer.id),
      );

      if (
        unratedCustomers &&
        unratedCustomers?.length < 1 &&
        missingDevs &&
        missingDevs?.length < 1
      )
        return false;
      return true;
    });

    return unrated;
  };

  // Return tasks that are not rated by logged in user
  const getUnratedTasks: () => Task[] = () => {
    return getRenderTaskList().filter((task) =>
      taskAwaitsRatings(task, userInfo),
    );
  };

  // Compare all tasks to given array of tasks and return the difference
  const getRemainingTasks: (passedTasks: Task[]) => Task[] = (
    passedTasks: Task[],
  ) => {
    return getRenderTaskList().filter((task) => !passedTasks.includes(task));
  };

  // Return length of the tasks that are in the Waiting for ratings -table
  const getWaitingLength = () => {
    if (getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin)
      return getOwnerTask().length;
    return getUnratedTasks().length;
  };

  // Return length of the tasks that are in the Rated tasks -table
  const getRemainingLength = () => {
    if (getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin)
      return getRemainingTasks(getOwnerTask()).length;
    return getRemainingTasks(getUnratedTasks()).length;
  };

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
  };

  const toggleCheckedClicked = () => {
    setChecked(!checked);
    if (checked) setSearchFilter(FilterTypes.NOT_RATED_BY_ME);
    else setSearchFilter(FilterTypes.SHOW_ALL);
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

  const onAddNewTaskClick = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_TASK_MODAL,
        modalProps: {},
      }),
    );
  };

  const onImportTasksClick = (name: string) => (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.IMPORT_TASKS_MODAL,
        modalProps: { name },
      }),
    );
  };

  const renderImportButton = (name: string) => {
    // TODO: disable button if oauth is not completed
    // or maybe open the oauth modal first then
    if (currentRoadmap?.integrations.some((it) => it.name === name)) {
      return (
        <button
          className={classes(css['button-small-filled'])}
          type="submit"
          onClick={onImportTasksClick(name)}
        >
          <Trans i18nKey="Import tasks from" /> {titleCase(name)}
        </button>
      );
    }
    return null;
  };

  const renderTopbar = () => {
    return (
      <div className={classes(css.topBar)}>
        <div className={classes(css.searchBarContainer)}>
          {!nosearch && (
            <>
              <input
                className={classes(css.search)}
                placeholder={t('Search for tasks')}
                onChange={(e: any) => onSearchChange(e.currentTarget.value)}
              />
              <Search />
            </>
          )}
        </div>
        <div className={classes(css.addNewButtonContainer)}>
          {!nofilter && (
            <Checkbox
              label="Show completed tasks"
              onChange={toggleCheckedClicked}
              checked={checked}
            />
          )}
          {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin && (
            <>
              {renderImportButton('trello')}
              {renderImportButton('jira')}
              <button
                className={classes(css['button-small-filled'])}
                type="submit"
                onClick={onAddNewTaskClick}
              >
                + <Trans i18nKey="Add new task" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSortingArrow = () => {
    return sortingOrder === SortingOrders.ASCENDING ? (
      <ArrowUpCircle />
    ) : (
      <ArrowDownCircle />
    );
  };

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
          {/* TO DO: <TableTaskRow /> to <UnratedTableTaskRow /> */}
          {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin &&
            getOwnerTask().map((task) => (
              <TableTaskRow key={task.id} task={task} />
            ))}
          {/* TO DO: <TableTaskRow /> to <UnratedTableTaskRow /> */}
          {getType(userInfo?.roles, currentRoadmap?.id) !== RoleType.Admin &&
            getUnratedTasks().map((task) => (
              <TableTaskRow key={task.id} task={task} />
            ))}
        </tbody>
      </table>
    );
  };

  const renderRemainingTasks = () => {
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
          {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin &&
            getRemainingTasks(getOwnerTask()).map((task) => (
              <TableTaskRow key={task.id} task={task} />
            ))}
          {getType(userInfo?.roles, currentRoadmap?.id) !== RoleType.Admin &&
            getRemainingTasks(getUnratedTasks()).map((task) => (
              <TableTaskRow key={task.id} task={task} />
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      {renderTopbar()}
      {getRenderTaskList().length > 0 ? (
        <div>
          {getWaitingLength() > 0 && (
            <div className={classes(css.tableContainer)}>
              <h2 className={classes(css.tableHeader)}>
                Waiting for ratings ({getWaitingLength()})
                <InfoIcon className={classes(css.infoIcon)} />
              </h2>
              {renderUnratedTasks()}
            </div>
          )}
          {getRemainingLength() > 0 && (
            <div>
              <h2 className={classes(css.tableHeader)}>
                Rated tasks ({getRemainingLength()})
                <InfoIcon className={classes(css.infoIcon)} />
              </h2>
              {renderRemainingTasks()}
            </div>
          )}
        </div>
      ) : (
        <Trans i18nKey="No tasks found" />
      )}
    </>
  );
};
