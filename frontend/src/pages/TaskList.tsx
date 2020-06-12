import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Navbar, Form, Button, Col, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Search } from 'react-bootstrap-icons';
import { RootState } from '../redux/types';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { getRoadmaps } from '../redux/roadmaps/actions';
import { StoreDispatchType } from '../redux/index';
import { TableTaskRow } from '../components/TableTaskRow';
import { roadmapsActions } from '../redux/roadmaps/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';

const Styles = styled.div`
  .bottomborder {
    border: 0px;
    border-bottom: 1px solid black;
  }
`;

const SearchBarIcon = styled(Search)`
  position: absolute;
  top: 12px;
  right: 16px;
`;

export const TaskListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    dispatch(getRoadmaps()).then(() =>
      dispatch(roadmapsActions.selectCurrentRoadmap(1)),
    );
  }, [dispatch]);

  const getAndSearchTasks: () => Task[] = () => {
    let tasks: Task[] = [];
    if (currentRoadmap) tasks = currentRoadmap.tasks;

    return tasks.filter((task) =>
      task.name.toLowerCase().includes(searchString),
    );
  };

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
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
                <Form.Group className="m-0">
                  <Form.Control
                    placeholder={t('Search for tasks')}
                    onChange={(e) => onSearchChange(e.currentTarget.value)}
                    className="glyphicon glyphicon-search"
                  />
                  <SearchBarIcon />
                </Form.Group>
              </Col>
              <Col className="d-flex justify-content-end">
                <Form.Group className="m-0">
                  <Button variant="primary" onClick={onAddNewTaskClick}>
                    <Trans i18nKey="Add new task" />
                  </Button>
                </Form.Group>
              </Col>
            </Form.Row>
          </Form>
        </Navbar>
      </>
    );
  };

  const renderTasksTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>
              <Trans i18nKey="Status" />
            </th>
            <th>
              <Trans i18nKey="Task name" />
            </th>
            <th>
              <Trans i18nKey="Task description" />
            </th>
            <th>
              <Trans i18nKey="Required by" />
            </th>
            <th>
              <Trans i18nKey="Created at" />
            </th>
          </tr>
        </thead>
        <tbody>
          {getAndSearchTasks().map((task) => (
            <TableTaskRow
              key={task.id}
              id={task.id}
              name={task.name}
              roadmapId={task.roadmapId}
              description={task.description}
              completed={task.completed}
              createdAt={new Date(task.createdAt).toLocaleDateString()}
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
      {getAndSearchTasks().length > 0 ? (
        renderTasksTable()
      ) : (
        <Trans i18nKey="No tasks available" />
      )}
    </Styles>
  );
};
