import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import { StoreDispatchType } from '../../redux';
import { versionsActions } from '../../redux/versions';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './DeleteVersionModal.module.scss';

const classes = classNames.bind(css);

export const DeleteVersionModal: Modal<ModalTypes.DELETE_VERSION_MODAL> = ({
  closeModal,
  id,
  roadmapId,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    const res = await dispatch(
      versionsActions.deleteVersion({ id, roadmapId }),
    );
    setIsLoading(false);
    if (versionsActions.deleteVersion.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <div className={classes(css.headerDiv)}>
            <h3>
              <Trans i18nKey="Delete milestone" />
            </h3>
            <DeleteIcon />
          </div>
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.descriptionDiv)}>
            <Trans i18nKey="Delete milestone confirmation" />
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
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className="button-large" type="submit">
                <Trans i18nKey="Confirm" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
