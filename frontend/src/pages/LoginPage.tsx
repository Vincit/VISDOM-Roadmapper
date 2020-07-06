import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { StyledButton } from '../components/forms/StyledButton';
import { StyledFormControl } from '../components/forms/StyledFormControl';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';

const FormDiv = styled.div`
  padding: 8px;
  margin: auto;
  margin-top: 32px;
  width: 500px;
`;

export const LoginPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
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
        if (userActions.login.rejected.match(res)) {
          setHasError(true);
          if (res.payload) {
            if (res.payload.response?.status === 401) {
              setErrorMessage(t('Invalid username or password'));
            } else {
              setErrorMessage(res.payload.message);
            }
          }
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
      {userInfo && <Redirect to={query.get('redirectTo') || paths.home} />}
      <FormDiv>
        <ModalHeader>
          <Trans i18nKey="Login" />
        </ModalHeader>
        <ModalContent>
          <Form onSubmit={handleSubmit}>
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

            <StyledButton buttonType="submit" type="submit">
              <Trans i18nKey="Submit" />
            </StyledButton>
          </Form>
        </ModalContent>
      </FormDiv>
    </>
  );
};
