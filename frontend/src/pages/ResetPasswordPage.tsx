import { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { Alert } from 'react-bootstrap';
import { Link, useHistory, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { userActions } from '../redux/user';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Input, errorState } from '../components/forms/FormField';
import { Footer } from '../components/Footer';
import { paths } from '../routers/paths';
import { StoreDispatchType } from '../redux';
import { ReactComponent as CheckIcon } from '../icons/check_icon.svg';
import css from './ResetPasswordPage.module.scss';

const classes = classNames.bind(css);

export const ResetPasswordPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const { t } = useTranslation();
  const { token } = useParams<{
    token: string | undefined;
  }>();

  const [done, setDone] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const confirmationError = {
    err: errorState(useState('')),
  };

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (password !== confirmPassword) {
      confirmationError.err.setMessage(t('Password confirmation error'));
      return;
    }

    if (!token) return;

    const res = await dispatch(userActions.resetPassword({ token, password }));
    if (!userActions.resetPassword.rejected.match(res)) {
      setDone(true);
      return;
    }

    if (res.payload?.response?.status === 403)
      setErrorMessage(t('Token expired'));
    else if (res.payload?.response?.status === 404)
      setErrorMessage(t('Token not found'));
    else if (res.payload)
      setErrorMessage(t('Error message', { error: res.payload.message }));
  };

  const resetPasswordView = () => (
    <div className="formDiv">
      <ModalHeader>
        <h2>
          <Trans i18nKey="Reset password" />
        </h2>
      </ModalHeader>
      <ModalContent gap={30}>
        <div className="formSubtitle">
          <Trans i18nKey="Enter your new password below" />
        </div>
        <form onSubmit={handleReset}>
          <Input
            label={t('New password')}
            required
            minLength={8}
            maxLength={72}
            id="password"
            type="password"
            placeholder={t('Password')}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Input
            label={t('Confirm new password')}
            required
            id="confirm password"
            type="password"
            placeholder={t('Confirm password')}
            value={confirmPassword}
            error={confirmationError.err}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          />
          <button className="button-large" type="submit">
            <Trans i18nKey="Reset password" />
          </button>
          <Alert
            show={errorMessage.length > 0}
            variant="danger"
            dismissible
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        </form>
        <div className="formFooter">
          <Trans i18nKey="Remembered password" />{' '}
          <Link to={`${paths.loginPage}`}>
            <Trans i18nKey="Log in" />
          </Link>
        </div>
      </ModalContent>
    </div>
  );

  const doneView = () => (
    <div className="formDiv">
      <ModalHeader>
        <h2>
          <Trans i18nKey="Password reset" />
        </h2>
      </ModalHeader>
      <ModalContent gap={30}>
        <div className={classes(css.doneSubtitle)}>
          <div className={classes(css.doneCheckIcon)}>
            <CheckIcon />
          </div>
          <div className={classes(css.doneSubtitleText)}>
            <p>
              <Trans i18nKey="Password set success" />
            </p>
          </div>
          <div>
            <button
              className="button-large"
              type="button"
              onClick={() => history.push(paths.loginPage)}
            >
              <Trans i18nKey="Go to Login" />
            </button>
          </div>
        </div>
      </ModalContent>
    </div>
  );

  return (
    <>
      {done ? doneView() : resetPasswordView()}
      <Footer />
    </>
  );
};
