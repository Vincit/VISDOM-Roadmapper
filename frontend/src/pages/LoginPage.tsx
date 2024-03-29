import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
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
import { Input } from '../components/forms/FormField';

const classes = classNames.bind(css);

export const LoginPage = () => {
  const urlSearchString = useLocation().search;
  const queryParams = new URLSearchParams(urlSearchString);
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);
      dispatch(userActions.login(formValues)).then((res) => {
        setIsLoading(false);
        if (userActions.login.rejected.match(res)) {
          if (res.payload) {
            if (res.payload.response?.status === 401) {
              setErrorMessage(t('Invalid email or password'));
            } else {
              setErrorMessage(res.payload.message);
            }
          }
        }
      });
    }
  };

  const onEmailChange = (value: string) => {
    setFormValues({ ...formValues, email: value });
  };

  const onPasswordChange = (value: string) => {
    setFormValues({ ...formValues, password: value });
  };

  return (
    <>
      {userInfo && (
        <Redirect to={queryParams.get('redirectTo') || paths.home} />
      )}
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>
            <Trans i18nKey="Log in" />
          </h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <form onSubmit={handleSubmit}>
            <Input
              label={t('Your email')}
              required
              id="name"
              placeholder={t('Email')}
              value={formValues.email}
              onChange={(e) => onEmailChange(e.currentTarget.value)}
            />

            <Input
              label={t('Password')}
              required
              id="password"
              type="password"
              placeholder={t('Password')}
              value={formValues.password}
              onChange={(e) => onPasswordChange(e.currentTarget.value)}
            />
            {errorMessage.length > 0 && (
              <Alert
                severity="error"
                onClose={() => setErrorMessage('')}
                icon={false}
              >
                {errorMessage}
              </Alert>
            )}

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className={classes(css['button-large'])} type="submit">
                <Trans i18nKey="Log in" />
              </button>
            )}
          </form>
          <div className={classes(css.loginFooter)}>
            <div>
              <Trans i18nKey="No account?" />{' '}
              <Link to={`${paths.registerPage}${urlSearchString}`}>
                <Trans i18nKey="Register" />
              </Link>
            </div>
            <Link to={`${paths.forgotPassword}`}>
              <Trans i18nKey="Forgot password" />
            </Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
};
