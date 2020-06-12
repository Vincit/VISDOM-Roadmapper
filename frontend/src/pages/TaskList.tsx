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

enum FilterTypes {
  SHOW_ALL,
  NOT_RATED_BY_ME,
  RATED_BY_ME,
  COMPLETED,
  NOT_COMPLETED,
}

enum SortingTypes {
  NO_SORT,
  SORT_NAME,
  SORT_STATUS,
  SORT_DESC,
  SORT_REQUIREDBY,
  SORT_CREATEDAT,
}

enum SortingOrders {
  ASCENDING,
  DESCENDING,
}

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

  const filterNotRatedByMe = (task: Task) => {
    if (
      task.ratings?.find(
        (taskrating) => taskrating.createdByUser === userInfo?.id,
      )
    ) {
      return false;
    }

    return true;
  };

  const filterRatedByMe = (task: Task) => {
    if (
      task.ratings?.find(
        (taskrating) => taskrating.createdByUser === userInfo?.id,
      )
    ) {
      return true;
    }

    return false;
  };

  const filterTaskByCompletion = (completion: boolean) => {
    return (task: Task) => task.completed === completion;
  };

  const filterTasks = (taskList: Task[]) => {
    let filterFunc: (task: Task) => boolean;
    switch (searchFilter) {
      case FilterTypes.NOT_RATED_BY_ME:
        filterFunc = filterNotRatedByMe;
        break;
      case FilterTypes.RATED_BY_ME:
        filterFunc = filterRatedByMe;
        break;
      case FilterTypes.COMPLETED:
        filterFunc = filterTaskByCompletion(true);
        break;
      case FilterTypes.NOT_COMPLETED:
        filterFunc = filterTaskByCompletion(false);
        break;
      default:
        filterFunc = () => true;
    }
    return taskList.filter(filterFunc);
  };

  const sortTasks = (taskList: Task[]) => {
    const tasks = [...taskList];
    switch (sortingType) {
      case SortingTypes.SORT_CREATEDAT:
        tasks.sort(
          (a, b) =>
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
        );
        break;
      case SortingTypes.SORT_NAME:
        tasks.sort(
          (a, b) =>
            a.name.localeCompare(b.name) *
            (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
        );
        break;
      case SortingTypes.SORT_DESC:
        tasks.sort(
          (a, b) =>
            a.description.localeCompare(b.description) *
            (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
        );
        break;
      case SortingTypes.SORT_REQUIREDBY:
        tasks.sort(
          (a, b) =>
            a.requiredBy.localeCompare(b.requiredBy) *
            (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
        );
        break;
      case SortingTypes.SORT_STATUS:
        tasks.sort(
          (a, b) =>
            (+a.completed - +b.completed) *
            (sortingOrder === SortingOrders.DESCENDING ? -1 : 1),
        );
        break;
      default:
        // SortingTypes.NO_SORT
        break;
    }

    // if (sortingOrder === SortingOrders.DESCENDING) tasks.reverse();
    return tasks;
  };

  const getRenderTaskList: () => Task[] = () => {
    let tasks: Task[] = [];
    if (currentRoadmap) tasks = currentRoadmap.tasks;

    // Filter, search, sort tasks
    const filtered = filterTasks(tasks);
    const searched = filtered.filter(
      (task) =>
        task.name.toLowerCase().includes(searchString) ||
        task.description.toLowerCase().includes(searchString),
    );
    const sorted = sortTasks(searched);

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
    { label: 'Required by', sorting: SortingTypes.SORT_REQUIREDBY },
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
            <TableTaskRow
              key={task.id}
              id={task.id}
              name={task.name}
              roadmapId={task.roadmapId}
              description={task.description}
              completed={task.completed}
              createdAt={new Date(task.createdAt)}
              requiredBy={task.requiredBy}
            />
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
