import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';

export const UserAuthTokenModal: React.FC<ModalProps> = ({ closeModal }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <ModalHeader>
        <h3>
          <Trans i18nKey="Manage personal auth token" />
        </h3>
        <ModalCloseButton onClick={closeModal} />
      </ModalHeader>
      <ModalContent>
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
      </ModalFooter>
    </>
  );
};
