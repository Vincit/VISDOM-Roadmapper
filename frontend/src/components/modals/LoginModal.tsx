import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';
import { StyledButton } from '../forms/StyledButton';
import { StyledFormControl } from '../forms/StyledFormControl';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';

export interface LoginModalProps extends ModalProps {
  username?: string;
  password?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  closeModal,
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
      ).then((res) => {
        // Redux-toolkit way to check if the thunk resolved or rejected
        if (userActions.login.rejected.match(res)) {
          setHasError(true);
          if (res.payload) {
            if (res.payload.response?.status === 401) {
              setErrorMessage(t('Invalid username or password'));
            } else {
              setErrorMessage(res.payload.message);
            }
          }
        } else {
          closeModal();
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
    <>
      <ModalCloseButton onClick={closeModal} />
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <Trans i18nKey="Login" />
        </ModalHeader>
        <ModalContent>
          <Form.Group>
            <StyledFormControl
              required
              name="name"
              id="name"
              placeholder={t('Username')}
              value={formValues.username}
              onChange={(e: any) => onUsernameChange(e.currentTarget.value)}
            />
          </Form.Group>

          <Form.Group>
            <StyledFormControl
              required
              name="description"
              id="description"
              type="password"
              placeholder={t('Password')}
              value={formValues.password}
              onChange={(e: any) => onPasswordChange(e.currentTarget.value)}
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
        </ModalContent>
        <ModalFooter>
          <ModalFooterButtonDiv rightmargin>
            <StyledButton fullWidth buttonType="cancel" onClick={closeModal}>
              <Trans i18nKey="Cancel" />
            </StyledButton>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            <StyledButton fullWidth buttonType="submit" type="submit">
              <Trans i18nKey="Submit" />
            </StyledButton>
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
