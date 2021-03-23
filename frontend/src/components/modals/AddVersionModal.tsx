/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { versionsActions } from '../../redux/versions';
import { StyledButton } from '../forms/StyledButton';
import { StyledFormControl } from '../forms/StyledFormControl';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';

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
          <StyledFormControl
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
            <StyledButton
              fullWidth
              buttonType="cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </StyledButton>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <StyledButton fullWidth buttonType="submit" type="submit">
                <Trans i18nKey="Add" />
              </StyledButton>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
