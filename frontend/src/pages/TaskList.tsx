import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Navbar, Form, Button, Col, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Search, ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { RootState } from '../redux/types';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { getRoadmaps } from '../redux/roadmaps/actions';
import { StoreDispatchType } from '../redux/index';
import { TableTaskRow } from '../components/TableTaskRow';
import { roadmapsActions } from '../redux/roadmaps/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import {
  FilterTypes,
  SortingTypes,
  SortingOrders,
  filterTasks,
  sortTasks,
} from '../utils/TaskUtils';

const Styles = styled.div`
  .bottomborder {
    border: 0px;
    border-bottom: 1px solid black;
  }
`;

const SearchBarIcon = styled(Search)`
  position: absolute;
  top: 0.7em;
  right: 1em;
`;

const SortAscendingIcon = styled(ArrowUpCircle)`
  position: absolute;
  right: -1.6em;
  width: 1.2em;
  height: 1.2em;
  top: 0.2em;
`;

const SortDescendingIcon = styled(ArrowDownCircle)`
  position: absolute;
  right: -1.6em;
  width: 1.2em;
  height: 1.2em;
  top: 0.2em;
`;

const ClickableHeader = styled.th`
  position: relative;
  cursor: pointer;
  user-select: none;
`;

const IconTextDiv = styled.div`
  position: relative;
  width: auto;
  display: inline-block;
`;

interface TableHeader {
  label: string;
  sorting: SortingTypes;
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

  // TODO REMOVE
  // Temporarily selecting roadmap & getting data here until proper roadmap selector component is implemented
  useEffect(() => {
    dispatch(getRoadmaps()).then(() =>
      dispatch(roadmapsActions.selectCurrentRoadmap(1)),
    );
  }, [dispatch]);

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

  const onAddNewTaskClick = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_TASK_MODAL,
        modalProps: {},
      }),
    );
  };

  const renderTopbar = () => {
    return (
      <>
        <Navbar className="justify-content-start bottomborder">
          <Form className="w-100">
            <Form.Row>
              <Col>
                <Form.Control
                  placeholder={t('Search for tasks')}
                  onChange={(e) => onSearchChange(e.currentTarget.value)}
                />
                <SearchBarIcon />
              </Col>
              <Col>
                <Form.Control
                  required
                  as="select"
                  onChange={(e) =>
                    onFilterChange(
                      parseInt(e.currentTarget.value, 10) as FilterTypes,
                    )
                  }
                  value={searchFilter}
                >
                  <option value={FilterTypes.SHOW_ALL}>{t('Show all')}</option>
                  <option value={FilterTypes.NOT_RATED_BY_ME}>
                    {t('Not rated by me')}
                  </option>
                  <option value={FilterTypes.RATED_BY_ME}>
                    {t('Rated by me')}
                  </option>
                  <option value={FilterTypes.COMPLETED}>
                    {t('Completed')}
                  </option>
                  <option value={FilterTypes.NOT_COMPLETED}>
                    {t('Not completed')}
                  </option>
                </Form.Control>
              </Col>
              <Col className="d-flex justify-content-end">
                <Button variant="primary" onClick={onAddNewTaskClick}>
                  <Trans i18nKey="Add new task" />
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Navbar>
      </>
    );
  };

  const renderSortingArrow = () => {
    return sortingOrder === SortingOrders.ASCENDING ? (
      <SortAscendingIcon />
    ) : (
      <SortDescendingIcon />
    );
  };

  const tableHeaders: TableHeader[] = [
    { label: 'Status', sorting: SortingTypes.SORT_STATUS },
    { label: 'Task name', sorting: SortingTypes.SORT_NAME },
    { label: 'Task description', sorting: SortingTypes.SORT_DESC },
    { label: 'Ratings', sorting: SortingTypes.SORT_RATINGS },
    { label: 'Created at', sorting: SortingTypes.SORT_CREATEDAT },
  ];

  const renderTasksTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            {tableHeaders.map((header) => {
              return (
                <ClickableHeader
                  key={header.label}
                  onClick={() => onSortingChange(header.sorting)}
                >
                  <IconTextDiv>
                    <Trans i18nKey={header.label} />
                    {sortingType === header.sorting
                      ? renderSortingArrow()
                      : null}
                  </IconTextDiv>
                </ClickableHeader>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {getRenderTaskList().map((task) => (
            <TableTaskRow key={task.id} task={task} />
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Styles>
      {renderTopbar()}
      {getRenderTaskList().length > 0 ? (
        renderTasksTable()
      ) : (
        <Trans i18nKey="No tasks found" />
      )}
    </Styles>
  );
};
