/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Checkbox } from './forms/Checkbox';
import { TableTaskRow } from './TableTaskRow';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { UserType } from '../../../shared/types/customTypes';
import {
  filterTasks,
  FilterTypes,
  SortingOrders,
  SortingTypes,
  sortTasks,
} from '../utils/TaskUtils';
import css from './TaskTable.module.scss';

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

  const onImportTasksClick = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.IMPORT_TASKS_MODAL,
        modalProps: {},
      }),
    );
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
          {userInfo!.type === UserType.AdminUser && (
            <>
              <button
                className={classes(css['button-small-filled'])}
                type="submit"
                onClick={onImportTasksClick}
              >
                <Trans i18nKey="Import tasks from JIRA" />
              </button>
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

  const renderTasksTable = () => {
    return (
      <table className={classes(css.styledTable)}>
        <thead>
          <tr className={classes(css.styledTr)}>
            {tableHeaders.map((header) => {
              return (
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
                    {sortingType === header.sorting
                      ? renderSortingArrow()
                      : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {getRenderTaskList().map((task) => (
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
        renderTasksTable()
      ) : (
        <Trans i18nKey="No tasks found" />
      )}
    </>
  );
};
