import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { roadmapsActions } from '../redux/roadmaps/index';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { TaskRequest } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { ModalProps } from './types';

const Styles = styled.div``;

export const AddTaskModal: React.FC<ModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
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
        createdByUser: userInfo?.id,
      };

      dispatch(roadmapsActions.addTask(req)).then((res) => {
        if (roadmapsActions.addTask.rejected.match(res)) {
          setHasError(true);
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          onClose();
          dispatch(
            modalsActions.showModal({
              modalType: ModalTypes.RATE_TASK_MODAL,
              modalProps: {
                task: res.payload,
                cameFromTaskCreation: true,
              },
            }),
          );
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
