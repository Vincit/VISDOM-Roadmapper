import { useState, useEffect, FormEvent, useRef } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { paths } from '../routers/paths';
import { Input, errorState } from '../components/forms/FormField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ReactComponent as MailIcon } from '../icons/mail_icon.svg';
import { api } from '../api/api';
import css from './ForgotPassword.module.scss';

const classes = classNames.bind(css);

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const defaultDisableSeconds = 30;

  const [linkSent, setLinkSent] = useState(false);
  const [email, setEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendDisableTime, setResendDisableTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const confirmationError = errorState(useState(''));

  type Timeout = ReturnType<typeof setTimeout>;
  const timeout = useRef<Timeout | null>(null);
  const interval = useRef<Timeout | null>(null);

  // Cleanup timers after unmounting
  useEffect(
    () => () => {
      if (timeout.current !== null) clearTimeout(timeout.current);
      if (interval.current !== null) clearInterval(interval.current);
    },
    [],
  );

  const sendEmailLink = () => {
    return api.sendPasswordResetLink(email);
  };

  const createDisableTimer = (time: number) => {
    setResendDisableTime(time);
    setResendDisabled(true);

    const countdownInterval = setInterval(() => {
      setResendDisableTime((previous) => previous - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      setResendDisabled(false);
    }, time * 1000);
  };

  const isUniqueError = (err: any) => err.response?.status === 404;

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      await sendEmailLink();
    } catch (err) {
      if (isUniqueError(err)) {
        confirmationError.setMessage(t('This email doesn’t exist'));
      } else {
        setErrorMessage(t('Email service error'));
      }
      setIsLoading(false);
      return;
    }

    createDisableTimer(defaultDisableSeconds / 2);
    setErrorMessage('');
    setIsLoading(false);
    setLinkSent(true);
  };

  const handleResend = () => {
    sendEmailLink();
    createDisableTimer(defaultDisableSeconds);
  };

  const sendLinkView = () => (
    <div className="formDiv">
      <ModalHeader>
        <h2>
          <Trans i18nKey="Forgot password" />
        </h2>
      </ModalHeader>
      <ModalContent gap={30}>
        <div className="formSubtitle">
          <Trans i18nKey="Forgot password subtitle" />
        </div>
        <form onSubmit={handleSend}>
          <Input
            label={t('Your email')}
            required
            id="email"
            type="email"
            placeholder={t('Email')}
            value={email}
            error={confirmationError}
            onChange={(e) => setEmail(e.currentTarget.value)}
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
            <button
              className="button-large"
              type="submit"
              disabled={resendDisabled}
            >
              {resendDisabled ? (
                <Trans
                  i18nKey="Retry timer"
                  values={{ time: resendDisableTime }}
                />
              ) : (
                <Trans i18nKey="Send link" />
              )}
            </button>
          )}
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

  const linkSentView = () => (
    <div className="formDiv">
      <ModalHeader>
        <h2>
          <Trans i18nKey="Reset link sent" />
        </h2>
      </ModalHeader>
      <ModalContent gap={30}>
        <div className={classes(css.secondSubtitle)}>
          <MailIcon />
          <p>
            <Trans i18nKey="We have sent an email" values={{ email }} />
          </p>
        </div>
        <div
          className={classes(css.formFooter)}
          style={{ textAlign: 'center' }}
        >
          <div style={{ marginBottom: '16px' }}>
            <Trans i18nKey="Wrong email address?" />{' '}
            <button
              className={classes(css.linkButton, css.green)}
              type="button"
              onClick={() => setLinkSent(false)}
            >
              <Trans i18nKey="Change address" />
            </button>
          </div>
          <div>
            {resendDisabled ? (
              <>
                <Trans i18nKey="Reset link sent successfully" />{' '}
                <Trans
                  i18nKey="Retry timer"
                  values={{ time: resendDisableTime }}
                />
              </>
            ) : (
              <>
                <Trans i18nKey="Didn’t receive the email" />{' '}
                <button
                  type="button"
                  className={classes(css.linkButton, css.green)}
                  onClick={handleResend}
                >
                  <Trans i18nKey="Resend link" />
                </button>
              </>
            )}
          </div>
        </div>
      </ModalContent>
    </div>
  );

  return (
    <>
      {linkSent ? linkSentView() : sendLinkView()}
      <Footer />
    </>
  );
};
