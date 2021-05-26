import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useLocation, Link } from 'react-router-dom';
import classNames from 'classnames';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import css from './LoginPage.module.scss';
import { Footer } from '../components/Footer';

const classes = classNames.bind(css);

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
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);
      dispatch(
        userActions.login({
          username: formValues.username,
          password: formValues.password,
        }),
      ).then((res) => {
        setIsLoading(false);
        if (userActions.login.rejected.match(res)) {
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
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>
            <Trans i18nKey="Log in" />
          </h2>
        </ModalHeader>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Your email</label>
            <input
              required
              name="name"
              id="name"
              placeholder={t('Email')}
              value={formValues.username}
              onChange={(e: any) => onUsernameChange(e.currentTarget.value)}
            />

            <label htmlFor="description">Password</label>
            <input
              required
              name="description"
              id="description"
              type="password"
              placeholder={t('Password')}
              value={formValues.password}
              onChange={(e: any) => onPasswordChange(e.currentTarget.value)}
            />
            <Alert
              show={errorMessage.length > 0}
              variant="danger"
              dismissible
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className={classes(css['button-large'])} type="submit">
                <Trans i18nKey="Log in" />
              </button>
            )}
          </form>
          <div className={classes(css.loginFooter)}>
            <Trans i18nKey="No account?" />{' '}
            <Link to={paths.registerPage}>
              <Trans i18nKey="Register" />
            </Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
};
