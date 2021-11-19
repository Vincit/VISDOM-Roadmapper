import { FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import '../../shared.scss';

export const RemoveTaskModal: Modal<ModalTypes.REMOVE_TASK_MODAL> = ({
  closeModal,
  task,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage('');

    setIsLoading(true);
    const res = await dispatch(roadmapsActions.deleteTask(task));
    setIsLoading(false);
    if (roadmapsActions.deleteTask.rejected.match(res))
      if (res.payload?.message) return setErrorMessage(res.payload.message);
    closeModal();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Remove task" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertIcon />
          <div>
            <Trans i18nKey="Remove task warning" values={{ name: task.name }} />
          </div>
        </div>
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
            onClick={() => closeModal()}
            type="button"
          >
            <Trans i18nKey="No, go back" />
          </button>
        </ModalFooterButtonDiv>
        <ModalFooterButtonDiv>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button className="button-large" type="submit">
              <Trans i18nKey="Yes, remove it" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
