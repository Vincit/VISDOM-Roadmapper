import { useState, FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { paths } from '../routers/paths';
import { Input } from '../components/forms/FormField';
import { ReactComponent as MailIcon } from '../icons/mail_icon.svg';
import { api } from '../api/api';
import css from './ForgotPassword.module.scss';

const classes = classNames.bind(css);

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const defaultDisableTime = 30; // Seconds

  const [view, setView] = useState('Send link');
  const [email, setEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [disableTime, setDisableTime] = useState(defaultDisableTime);

  const sendEmailLink = () => {
    api.sendPasswordResetLink(email);
  };

  const disableSending = () => {
    setResendDisabled(true);

    const countdownInterval = setInterval(() => {
      if (disableTime > 0) setDisableTime((previous) => previous - 1);
    }, 1000);

    setTimeout(() => setResendDisabled(false), defaultDisableTime * 1000);
    setTimeout(() => {
      clearInterval(countdownInterval);
      setDisableTime(defaultDisableTime);
    }, defaultDisableTime * 1000);
  };

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    sendEmailLink();
    setView('Link sent');
  };

  const handleResend = () => {
    sendEmailLink();
    setDisableTime(defaultDisableTime);
    disableSending();
  };

  const sendLinkView = () => {
    return (
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
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <button className="button-large" type="submit">
              <Trans i18nKey="Send link" />
            </button>
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
  };

  const linkSentView = () => {
    return (
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
                onClick={() => setView('Send link')}
              >
                <Trans i18nKey="Change address" />
              </button>
            </div>
            <div>
              {!resendDisabled && (
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
              {resendDisabled && (
                <>
                  <Trans i18nKey="Reset link sent successfully" />{' '}
                  <Trans i18nKey="Retry timer" values={{ time: disableTime }} />
                </>
              )}
            </div>
          </div>
        </ModalContent>
      </div>
    );
  };

  return (
    <>
      {view === 'Send link' && sendLinkView()}
      {view === 'Link sent' && linkSentView()}
      <Footer />
    </>
  );
};
