import { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { userActions } from '../../redux/user';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import '../../shared.scss';
import { apiV2 } from '../../api/api';

export const RemovePeopleModal: Modal<ModalTypes.REMOVE_PEOPLE_MODAL> = ({
  closeModal,
  id,
  name,
  type,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteCustomerTrigger] = apiV2.useDeleteCustomerMutation();
  const [deleteInvitationTrigger] = apiV2.useDeleteInvitationMutation();
  const [deleteRoadmapUser] = apiV2.useDeleteRoadmapUserMutation();

  const roadmapId = useSelector(chosenRoadmapIdSelector)!;

  const deleteCustomer = async () => {
    try {
      await deleteCustomerTrigger({
        roadmapId,
        customer: { id: id as number },
      }).unwrap();
    } catch (err: any) {
      return err.data?.message;
    }
    await dispatch(userActions.getUserInfo());
  };

  const deleteTeamMember = async () => {
    try {
      await deleteRoadmapUser({
        roadmapId,
        user: { id: id as number },
      }).unwrap();
    } catch (err: any) {
      return err.data?.message;
    }
  };

  const deleteInvitation = async () => {
    try {
      await deleteInvitationTrigger({
        roadmapId,
        id: id as string,
      }).unwrap();
    } catch (err: any) {
      return err.data?.message;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    let error;
    if (type === 'customer') error = await deleteCustomer();
    else if (type === 'team') error = await deleteTeamMember();
    else error = await deleteInvitation();
    setIsLoading(false);

    if (error) setErrorMessage(error);
    else closeModal();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          {type === 'customer' && <Trans i18nKey="Remove client" />}
          {type === 'team' && <Trans i18nKey="Remove team member" />}
          {type === 'invitation' && <Trans i18nKey="Remove invitation" />}
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertIcon />
          <div>
            <Trans i18nKey={`Remove ${type} warning`} values={{ name }} />
          </div>
          {type !== 'customer' && <Trans i18nKey="Remove member explanation" />}
        </div>
        {errorMessage.length > 0 && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage('')}
            icon={false}
          >
            {errorMessage}
          </Alert>
        )}
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
