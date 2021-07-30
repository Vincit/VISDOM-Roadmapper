import { FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { userActions } from '../../redux/user';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import '../../shared.scss';

export const RemovePeopleModal: Modal<ModalTypes.REMOVE_PEOPLE_MODAL> = ({
  closeModal,
  userId,
  userName,
  type,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const deleteCustomer = async () => {
    const res = await dispatch(roadmapsActions.deleteCustomer({ id: userId }));
    setIsLoading(false);
    if (roadmapsActions.deleteCustomer.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
    await dispatch(userActions.getUserInfo());
  };

  const deleteTeamMember = async () => {
    const res = await dispatch(
      roadmapsActions.deleteRoadmapUser({ id: userId }),
    );
    setIsLoading(false);
    if (roadmapsActions.deleteRoadmapUser.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    if (type === 'customer') deleteCustomer();
    else deleteTeamMember();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <h3>
            {type === 'customer' ? (
              <Trans i18nKey="Remove client" />
            ) : (
              <Trans i18nKey="Remove team member" />
            )}
          </h3>
        </ModalHeader>
        <ModalContent>
          <div className="modalCancelContent">
            <AlertIcon />
            {type === 'customer' ? (
              <h6>
                Are you sure you want to remove <b>{userName}</b>?
              </h6>
            ) : (
              <>
                <h6>
                  Are you sure you want to remove <b>{userName}</b> from the
                  project?
                </h6>
                <h6>
                  This won’t delete their account; only removes them from this
                  project.
                </h6>
              </>
            )}
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
    </>
  );
};
