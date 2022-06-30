import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import { apiV2 } from '../../api/api';
import css from './RemoveAttachmentModal.module.scss';

const classes = classNames.bind(css);

export const RemoveAttachmentModal: Modal<ModalTypes.REMOVE_ATTACHMENT_MODAL> = ({
  closeModal,
  roadmapId,
  attachment,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteAttachment, { isLoading }] = apiV2.useDeleteAttachmentMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage('');
    try {
      await deleteAttachment({ roadmapId, ...attachment }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Remove attachment" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="modalCancelContent">
          <AlertIcon />
          <div className={classes(css.warningText)}>
            <Trans
              i18nKey="Remove attachment warning"
              values={{ link: attachment }}
            >
              Are you sure you want to remove attachment{' '}
              <a href={attachment.attachment}>{attachment.attachment}</a>?
            </Trans>
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
            <button className={classes(css.button)} type="submit">
              <Trans i18nKey="Yes, remove attachment" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
