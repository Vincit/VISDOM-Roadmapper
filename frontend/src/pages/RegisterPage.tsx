/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Alert } from 'react-bootstrap';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Checkbox from '@material-ui/core/Checkbox';
import { Link, useHistory } from 'react-router-dom';
import { userActions } from '../redux/user';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { paths } from '../routers/paths';
import { StoreDispatchType } from '../redux';
import css from './RegisterPage.module.scss';

const classes = classNames.bind(css);

export const RegisterPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [checked, setChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!checked) return setErrorMessage(t('Terms of use error'));
    if (formValues.password.length < 8)
      return setErrorMessage(t('Password type error'));

    dispatch(
      userActions.register({
        username: formValues.name,
        email: formValues.email,
        password: formValues.password,
        type: 2,
      }),
    ).then((res) => {
      if (userActions.register.rejected.match(res)) {
        if (res.payload) {
          if (res.payload.response?.data.message.includes('username'))
            return setErrorMessage(t('Username already taken.'));
          if (res.payload.response?.data.message.includes('email'))
            return setErrorMessage(t('This email is already in use.'));
          return setErrorMessage(res.payload.response?.data.message);
        }
      }
      if (userActions.register.fulfilled.match(res)) {
        history.push('/login');
      }
    });
  };

  const EmeraldCheckBox = withStyles({
    root: {
      color: '#DADADA',
      '&$checked': {
        color: '#0ec679',
      },
    },
    checked: {},
  })((props) => (
    <Checkbox
      color="default"
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
      {...props}
    />
  ));

  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <Trans i18nKey="New here?" />
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.about)}>
            <Trans i18nKey="Please fill out some info about you." />
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">
              <Trans i18nKey="Your name" />
            </label>
            <input
              required
              name="name"
              id="name"
              placeholder={t('Your name')}
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.currentTarget.value })
              }
            />

            <label htmlFor="new-email">
              <Trans i18nKey="Your email" />
            </label>
            <input
              required
              name="new-email"
              id="new-email"
              type="email"
              placeholder={t('Example email')}
              autoComplete="off"
              value={formValues.email}
              onChange={(e) =>
                setFormValues({ ...formValues, email: e.currentTarget.value })
              }
            />

            <label htmlFor="new-password">
              <Trans i18nKey="Password" />
            </label>
            <input
              required
              name="new-password"
              id="new-password"
              placeholder="-"
              type="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  password: e.currentTarget.value,
                })
              }
            />

            <div className={classes(css.termsLabel)}>
              <EmeraldCheckBox />
              <Trans i18nKey="Terms of use">
                I agree to the <Link to="/terms">terms of use</Link> and{' '}
                <Link to="/privacy">privacy policy</Link>
              </Trans>
            </div>

            <Alert
              show={errorMessage.length > 0}
              variant="danger"
              dismissible
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>

            <button className={classes(css['button-large'])} type="submit">
              <Trans i18nKey="Create account" />
            </button>
          </form>
          <div className={classes(css.registerFooter)}>
            <Trans i18nKey="Already have an account?" />{' '}
            <Link to={paths.loginPage}>
              <Trans i18nKey="Log in" />
            </Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
};
