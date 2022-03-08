import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as MailIcon } from '../../icons/mail_icon.svg';
import '../../shared.scss';
import { apiV2 } from '../../api/api';

export const SendInvitationModal: Modal<ModalTypes.SEND_INVITATION_MODAL> = ({
  closeModal,
  invitation,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [sendInvitation, { isLoading }] = apiV2.useSendInvitationMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await sendInvitation({
        roadmapId: invitation.roadmapId,
        invitation: {
          email: invitation.email,
          type: invitation.type,
        },
      }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Send invitation" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <MailIcon />
          <div>
            <Trans
              i18nKey="Send invitation explanation"
              values={{ email: invitation.email }}
            />
          </div>
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
              <Trans i18nKey="Yes, send" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
