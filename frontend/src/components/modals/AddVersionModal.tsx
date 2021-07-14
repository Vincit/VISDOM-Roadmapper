import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { versionsActions } from '../../redux/versions';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Input } from '../forms/FormField';
import '../../shared.scss';

export const AddVersionModal: Modal<ModalTypes.ADD_VERSION_MODAL> = ({
  closeModal,
}) => {
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
        <ModalHeader closeModal={closeModal}>
          <h3>
            <Trans i18nKey="Add milestone" />
          </h3>
        </ModalHeader>
        <ModalContent>
          <Input
            label={t('Milestone name')}
            autoComplete="off"
            required
            type="text"
            name="name"
            id="name"
            value={versionName}
            placeholder={t('Milestone name')}
            onChange={(e) => onNameChange(e.currentTarget.value)}
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
        <ModalFooter closeModal={closeModal}>
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
