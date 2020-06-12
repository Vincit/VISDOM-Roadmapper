import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { ModalProps } from './types';
import { TaskRequest } from '../redux/roadmaps/types';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import {
  chosenRoadmapIdSelector,
  userGroupsSelector,
} from '../redux/roadmaps/selectors';
import { roadmapsActions } from '../redux/roadmaps/index';

const Styles = styled.div``;

export const AddTaskModal: React.FC<ModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    requiredBy: '',
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );
  const userGroups = useSelector<RootState, string[]>(
    userGroupsSelector,
    shallowEqual,
  );

  useEffect(() => {
    dispatch(roadmapsActions.getPublicUsers());
  }, [dispatch]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      const req: TaskRequest = {
        name: formValues.name,
        description: formValues.description,
        roadmapId: chosenRoadmapId,
        requiredBy: formValues.requiredBy,
      };

      dispatch(roadmapsActions.addTask(req)).then((res) => {
        if (roadmapsActions.addTask.rejected.match(res)) {
          setHasError(true);
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          onClose();
        }
      });
    }
  };

  const onNameChange = (name: string) => {
    setFormValues({ ...formValues, name });
  };

  const onDescriptionChange = (description: string) => {
    setFormValues({ ...formValues, description });
  };

  const onRequiredByChange = (requiredBy: string) => {
    setFormValues({ ...formValues, requiredBy });
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
            <Form.Group>
              <Form.Control
                required
                name="name"
                id="name"
                placeholder={t('Task name')}
                value={formValues.name}
                onChange={(e) => onNameChange(e.currentTarget.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Control
                required
                as="textarea"
                name="description"
                id="description"
                placeholder={t('Description')}
                value={formValues.description}
                onChange={(e) => onDescriptionChange(e.currentTarget.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                required
                as="select"
                onChange={(e) => onRequiredByChange(e.currentTarget.value)}
              >
                <option disabled selected>
                  Required by
                </option>
                {userGroups.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Alert
              show={hasError}
              variant="danger"
              dismissible
              onClose={() => setHasError(false)}
            >
              {errorMessage}
            </Alert>
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
