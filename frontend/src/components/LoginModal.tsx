import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { SerializedError, PayloadAction } from '@reduxjs/toolkit';
import { ModalProps } from './types';
import { StoreDispatchType } from '../redux';
import { userActions } from '../redux/user';
import { UserLoginRequest } from '../redux/user/types';

const Styles = styled.div``;

interface LoginModalProps extends ModalProps {
  username?: string;
  password?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  username,
  password,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [formValues, setFormValues] = useState({
    username: username || '',
    password: password || '',
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      dispatch(
        userActions.login({
          username: formValues.username,
          password: formValues.password,
        }),
      ).then((result) => {
        if (!result.payload) {
          // TODO make this neater somehow
          const resultCastType = result as PayloadAction<
            unknown,
            string,
            {
              arg: UserLoginRequest;
              requestId: string;
              aborted: boolean;
              condition: boolean;
            },
            SerializedError
          >;
          if (resultCastType.error && resultCastType.error.message) {
            setErrorMessage(resultCastType.error.message);
          }
          setHasError(true);
        } else {
          onClose();
        }
      });
    }
  };

  const onUsernameChange = (value: string) => {
    setFormValues({ ...formValues, username: value });
  };

  const onPasswordChange = (value: string) => {
    setFormValues({ ...formValues, password: value });
  };

  return (
    <Modal show onHide={onClose}>
      <Styles>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <Trans i18nKey="Login" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Control
                required
                name="name"
                id="name"
                placeholder={t('Username')}
                value={formValues.username}
                onChange={(e) => onUsernameChange(e.currentTarget.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Control
                required
                name="description"
                id="description"
                type="password"
                value={formValues.password}
                onChange={(e) => onPasswordChange(e.currentTarget.value)}
              />
            </Form.Group>
            <Alert
              show={hasError}
              variant="danger"
              dismissible
              onClose={() => setHasError(false)}
            >
              {errorMessage}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              <Trans i18nKey="Close" />
            </Button>
            <Button variant="primary" type="submit">
              <Trans i18nKey="Submit" />
            </Button>
          </Modal.Footer>
        </Form>
      </Styles>
    </Modal>
  );
};
