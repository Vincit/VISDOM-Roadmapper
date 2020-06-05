import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Navbar, Form, Button, Col, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { RootState } from '../redux/types';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { getRoadmaps } from '../redux/roadmaps/actions';
import { StoreDispatchType } from '../redux/index';
import { TableTaskRow } from '../components/TableTaskRow';
import { roadmapsActions } from '../redux/roadmaps/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';

const Line = styled.hr`
  background-color: rgba(0, 0, 0, 1);
  margin-top: 0;
  margin-bottom: 0;
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
        <Navbar className="justify-content-start">
          <Form className="w-100">
            <Form.Row>
              <Col>
                <Form.Group className="m-0">
                  <Form.Control
                    placeholder={t('Search for tasks')}
                    onChange={(e) => onSearchChange(e.currentTarget.value)}
                  />
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
              <Trans i18nKey="Task name" />
            </th>
            <th>
              <Trans i18nKey="Task description" />
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
            />
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <>
      {renderTopbar()}
      <Line />
      {getAndSearchTasks().length > 0 ? (
        renderTasksTable()
      ) : (
        <Trans i18nKey="No tasks available" />
      )}
    </>
  );
};
