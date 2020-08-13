import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  HeaderSpan,
  SearchBarContainer,
  StyledTable,
  StyledTh,
  TopBar,
} from '../components/CommonLayoutComponents';
import { StyledButton } from '../components/forms/StyledButton';
import { StyledFormControl } from '../components/forms/StyledFormControl';
import { TableTaskRow } from '../components/TableTaskRow';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import {
  filterTasks,
  FilterTypes,
  SortingOrders,
  SortingTypes,
  sortTasks,
} from '../utils/TaskUtils';

const FilterSelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  max-width: 20em;
  min-width: 6em;
  margin-left: 8px;
`;

const AddNewButtonContainer = styled.div`
  min-width: 10em;
  position: relative;
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  align-items: center;
  margin-right: 8px;
`;

interface TableHeader {
  label: string;
  sorting: SortingTypes;
  textAlign?: 'end' | 'left' | 'center';
  width?: string;
}

export const TaskListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const [searchFilter, setSearchFilter] = useState(FilterTypes.SHOW_ALL);
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  const getRenderTaskList: () => Task[] = () => {
    let tasks: Task[] = [];
    if (currentRoadmap) tasks = currentRoadmap.tasks;

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

  const onFilterChange = (filter: FilterTypes) => {
    setSearchFilter(filter);
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

  const renderTopbar = () => {
    return (
      <TopBar>
        <SearchBarContainer>
          <StyledFormControl
            placeholder={t('Search for tasks')}
            onChange={(e: any) => onSearchChange(e.currentTarget.value)}
          />
          <Search />
        </SearchBarContainer>
        <FilterSelectContainer>
          <StyledFormControl
            required
            as="select"
            onChange={(e: any) =>
              onFilterChange(parseInt(e.currentTarget.value, 10) as FilterTypes)
            }
            value={searchFilter}
          >
            <option value={FilterTypes.SHOW_ALL}>{t('Show all')}</option>
            <option value={FilterTypes.NOT_RATED_BY_ME}>
              {t('Not rated by me')}
            </option>
            <option value={FilterTypes.RATED_BY_ME}>{t('Rated by me')}</option>
            <option value={FilterTypes.COMPLETED}>{t('Completed')}</option>
            <option value={FilterTypes.NOT_COMPLETED}>
              {t('Not completed')}
            </option>
          </StyledFormControl>
        </FilterSelectContainer>
        <AddNewButtonContainer>
          {userInfo!.type === UserType.AdminUser && (
            <StyledButton buttonType="submit" onClick={onAddNewTaskClick}>
              + <Trans i18nKey="Add new" />
            </StyledButton>
          )}
        </AddNewButtonContainer>
      </TopBar>
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
      <StyledTable>
        <thead>
          <tr>
            {tableHeaders.map((header) => {
              return (
                <StyledTh
                  clickable
                  key={header.label}
                  onClick={() => onSortingChange(header.sorting)}
                  textAlign={header.textAlign}
                  width={header.width}
                >
                  <HeaderSpan>
                    <Trans i18nKey={header.label} />
                    {sortingType === header.sorting
                      ? renderSortingArrow()
                      : null}
                  </HeaderSpan>
                </StyledTh>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {getRenderTaskList().map((task) => (
            <TableTaskRow key={task.id} task={task} />
          ))}
        </tbody>
      </StyledTable>
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
