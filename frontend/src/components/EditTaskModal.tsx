import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps/index';
import { Task, TaskRequest } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { ModalProps } from './types';

export interface EditTaskModalProps extends ModalProps {
  task: Task;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  onClose,
  task,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [formValues, setFormValues] = useState({
    name: task.name,
    description: task.description,
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!userInfo) dispatch(userActions.getUserInfo());
  }, [userInfo, dispatch]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      const req: TaskRequest = {
        id: task.id,
        name: formValues.name,
        description: formValues.description,
        createdByUser: userInfo?.id,
      };

      dispatch(roadmapsActions.patchTask(req)).then((res) => {
        if (roadmapsActions.patchTask.rejected.match(res)) {
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

  return (
    <Modal show onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Trans i18nKey="Edit task" />
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
            <Trans i18nKey="Save" />
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
