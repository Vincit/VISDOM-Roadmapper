/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { versionsActions } from '../../redux/versions';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';

export const AddVersionModal: React.FC<ModalProps> = ({ closeModal }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [versionName, setVersionName] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);
      dispatch(
        versionsActions.addVersion({
          name: versionName,
        }),
      ).then((res) => {
        setIsLoading(false);
        if (versionsActions.addVersion.rejected.match(res)) {
          setHasError(true);
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeModal();
        }
      });
    }
  };

  const onNameChange = (name: string) => {
    setVersionName(name);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Add milestone" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>
        <ModalContent>
          <input
            className="input"
            autoComplete="off"
            required
            type="text"
            name="name"
            id="name"
            value={versionName}
            placeholder={t('Milestone name')}
            onChange={(e: any) => onNameChange(e.currentTarget.value)}
          />
          <Alert
            show={hasError}
            variant="danger"
            dismissible
            onClose={() => setHasError(false)}
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
