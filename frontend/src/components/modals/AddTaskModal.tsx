import React, { useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals';
import { ModalTypes } from '../../redux/modals/types';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { TaskRequest } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { userActions } from '../../redux/user';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { StyledFormControl } from '../forms/StyledFormControl';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';

export const AddTaskModal: React.FC<ModalProps> = ({ closeModal }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );
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
      setIsLoading(true);
      const req: TaskRequest = {
        name: formValues.name,
        description: formValues.description,
        roadmapId: chosenRoadmapId,
        createdByUser: userInfo?.id,
      };

      dispatch(roadmapsActions.addTask(req)).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.addTask.rejected.match(res)) {
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeModal();
          dispatch(
            modalsActions.showModal({
              modalType: ModalTypes.RATE_TASK_MODAL,
              modalProps: {
                taskId: res.payload.id,
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
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Add new task" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>
        <ModalContent>
          <Form.Group>
            <StyledFormControl
              autoComplete="off"
              required
              name="name"
              id="name"
              placeholder={t('Task name')}
              value={formValues.name}
              onChange={(e: any) => onNameChange(e.currentTarget.value)}
            />
          </Form.Group>

          <Form.Group>
            <StyledFormControl
              autoComplete="off"
              isTextArea
              required
              as="textarea"
              name="description"
              id="description"
              placeholder={t('Description')}
              value={formValues.description}
              onChange={(e: any) => onDescriptionChange(e.currentTarget.value)}
            />
          </Form.Group>
          <Alert
            show={errorMessage.length > 0}
            variant="danger"
            dismissible
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        </ModalContent>
        <ModalFooter>
          <ModalFooterButtonDiv>
            <button
              className="button-large cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className="button-large" type="submit">
                <Trans i18nKey="Add" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
