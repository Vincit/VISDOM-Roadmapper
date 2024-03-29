import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams, useHistory } from 'react-router-dom';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { requireLogin } from '../utils/requirelogin';
import { userActions } from '../redux/user';
import { StoreDispatchType } from '../redux';
import { paths } from '../routers/paths';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { api, apiV2 } from '../api/api';
import { ReactComponent as MailIcon } from '../icons/mail_icon.svg';
import { ReactComponent as MailIconChecked } from '../icons/mail_icon_checked.svg';
import css from './VerifyEmailPage.module.scss';

const classes = classNames.bind(css);

export const VerifyEmailPage = requireLogin(({ userInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { data: roadmaps } = apiV2.useGetRoadmapsQuery();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { verificationId } = useParams<{
    verificationId: string | undefined;
  }>();

  useEffect(() => {
    if (!verificationId || userInfo.emailVerified) return;

    setIsLoading(true);
    dispatch(userActions.verifyEmail({ user: userInfo, verificationId }))
      .then((res) => {
        if (userActions.verifyEmail.rejected.match(res)) {
          setErrorMessage(
            res.payload?.response?.data ||
              res.payload?.message ||
              'Something went wrong',
          );
        }
      })
      .finally(() => setIsLoading(false));
  }, [verificationId, userInfo, dispatch, history]);

  const renderContent = () => {
    if (!userInfo.emailVerified) {
      return (
        <div>
          <div>{errorMessage}</div>
          {isLoading && (
            <div className={classes(css.centered)}>
              <LoadingSpinner />
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <div className={classes(css.verifySubtitle)}>
          <Trans
            i18nKey="Your email has now been verified"
            values={{ email: userInfo.email }}
          />
        </div>
        <MailIconChecked className={classes(css.icon)} />
        <div className={classes(css.centered)}>
          <Trans i18nKey="Go explore" />
        </div>
        <Link
          className={classes(css['button-large'], css.centered)}
          to={roadmaps?.length ? paths.overview : paths.getStarted}
        >
          <Trans i18nKey="Go to my projects" />
        </Link>
        <div className={classes(css.formFooter)}>
          <Trans i18nKey="Explore later?" />{' '}
          <Link to={paths.logoutPage}>
            <Trans i18nKey="Log out" />
          </Link>
        </div>
      </>
    );
  };

  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>
            {userInfo.emailVerified && !errorMessage && (
              <Trans i18nKey="Email verified" />
            )}
            {!userInfo.emailVerified && errorMessage && (
              <Trans i18nKey="Email verification failed" />
            )}
          </h2>
        </ModalHeader>
        <ModalContent gap={50}>{renderContent()}</ModalContent>
      </div>
      <Footer />
    </>
  );
});

export const EmailVerificationPage = requireLogin(({ userInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [sending, setSending] = useState(false);
  const sendLink = () => {
    setSending(true);
    api
      .sendEmailVerificationLink(userInfo)
      .then((ok) => {
        if (ok) dispatch(userActions.getUserInfo());
      })
      .finally(() => setSending(false));
  };
  const linkSent =
    userInfo.emailVerificationLink &&
    new Date(userInfo.emailVerificationLink.updatedAt);
  const linkValid = userInfo.emailVerificationLink?.valid;
  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>
            <Trans i18nKey="Verify email address" />
          </h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <div className={classes(css.formSubtitle)}>
            <Trans i18nKey="verify email before your journey" />
          </div>
          <MailIcon className={classes(css.icon)} />
          <div>
            {linkValid ? (
              <Trans
                i18nKey="valid email verification link info"
                values={{
                  email: userInfo.email,
                  sent: linkSent!.toLocaleDateString(),
                }}
              />
            ) : (
              <Trans
                i18nKey="no email verification link info"
                values={{ email: userInfo.email }}
              />
            )}
          </div>
          <button
            className={classes(css['button-large'])}
            type="submit"
            tabIndex={0}
            disabled={sending}
            onClick={sendLink}
          >
            {sending ? <LoadingSpinner /> : <Trans i18nKey="Resend email" />}
          </button>
          <div className={classes(css.formFooter)}>
            <Trans i18nKey="Wrong email address?" />{' '}
            <Link to={paths.userInfo}>
              <Trans i18nKey="Change address" />
            </Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
});
