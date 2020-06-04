import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Modal, Button, Form } from 'react-bootstrap';
import { ModalProps } from './types';
import { TaskRequest } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps/index';

const Styles = styled.div``;

export const AddTaskModal: React.FC<ModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [state, setState] = useState({ name: '', description: '' });
  const chosenRoadmapId = useSelector<RootState, Number | undefined>(
    chosenRoadmapIdSelector,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      const req: TaskRequest = {
        name: state.name,
        description: state.description,
        parentRoadmap: chosenRoadmapId,
      };

      dispatch(roadmapsActions.addTask(req));

      onClose();
    }
  };

  const onNameChange = (name: string) => {
    setState({ ...state, name });
  };

  const onDescriptionChange = (description: string) => {
    setState({ ...state, description });
  };

  return (
    <Modal show onHide={onClose}>
      <Styles>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <Trans i18nKey="Add new task" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="name">
              <Form.Control
                required
                name="name"
                id="name"
                placeholder={t('Task name')}
                onChange={(e) => onNameChange(e.currentTarget.value)}
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Control
                required
                as="textarea"
                name="description"
                id="description"
                placeholder={t('Description')}
                onChange={(e) => onDescriptionChange(e.currentTarget.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              <Trans i18nKey="Close" />
            </Button>
            <Button variant="primary" type="submit">
              <Trans i18nKey="Add" />
            </Button>
          </Modal.Footer>
        </Form>
      </Styles>
    </Modal>
  );
};
