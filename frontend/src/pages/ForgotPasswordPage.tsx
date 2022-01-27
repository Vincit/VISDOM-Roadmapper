import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
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
  const defaultDisableTime = 30; // Seconds

  const [linkSent, setLinkSent] = useState(false);
  const [email, setEmail] = useState('');
  const [sendDisabled, setSendDisabled] = useState(false);
  const [sendDisableTime, setSendDisableTime] = useState(
    defaultDisableTime / 2,
  );
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendDisableTime, setResendDisableTime] = useState(
    defaultDisableTime,
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  let timeoutArray = useMemo(() => {
    const array: NodeJS.Timeout[] = [];
    return array;
  }, []);

  let intervalArray = useMemo(() => {
    const array: NodeJS.Timeout[] = [];
    return array;
  }, []);

  // Cleanup timers after unmounting
  useEffect(
    () => () => {
      timeoutArray.forEach((timeout) => {
        clearTimeout(timeout);
      });
      intervalArray.forEach((interval) => {
        clearInterval(interval);
      });
    },
    [timeoutArray, intervalArray],
  );

  const confirmationError = {
    err: errorState(useState('')),
  };

  const sendEmailLink = () => {
    return api.sendPasswordResetLink(email);
  };

  const createDisableTimer = (
    setDisableTime: React.Dispatch<React.SetStateAction<number>>,
    setDisabled: React.Dispatch<React.SetStateAction<boolean>>,
    time: number,
  ) => {
    setDisabled(true);

    const countdownInterval = setInterval(() => {
      setDisableTime((previous) => previous - 1);
    }, 1000);

    const disableTimer = setTimeout(() => {
      clearInterval(countdownInterval);

      // Remove timeout and interval from the arrays after completing them
      timeoutArray = timeoutArray.splice(timeoutArray.indexOf(disableTimer), 1);
      intervalArray = intervalArray.splice(
        intervalArray.indexOf(countdownInterval),
        1,
      );
      setDisabled(false);
      setDisableTime(time);
    }, time * 1000);

    timeoutArray.push(disableTimer);
    intervalArray.push(countdownInterval);
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
        confirmationError.err.setMessage(t('This email doesn’t exist'));
      } else {
        setErrorMessage(t('Email service error'));
      }
      setIsLoading(false);
      return;
    }

    setResendDisableTime(defaultDisableTime / 2);
    createDisableTimer(
      setSendDisableTime,
      setSendDisabled,
      defaultDisableTime / 2,
    );
    setErrorMessage('');
    setIsLoading(false);
    setLinkSent(true);
  };

  const handleResend = () => {
    sendEmailLink();
    setResendDisableTime(defaultDisableTime);
    createDisableTimer(
      setResendDisableTime,
      setResendDisabled,
      defaultDisableTime,
    );
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
            error={confirmationError.err}
            onChange={(e) => setEmail(e.currentTarget.value)}
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
            <button
              className="button-large"
              type="submit"
              disabled={sendDisabled}
            >
              {sendDisabled ? (
                <Trans
                  i18nKey="Retry timer"
                  values={{ time: sendDisableTime }}
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
        <div className="formFooter" style={{ textAlign: 'center' }}>
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
