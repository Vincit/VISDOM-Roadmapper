/* eslint-disable */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { requireLogin } from '../utils/requirelogin';
import { userActions } from '../redux/user';
import { StoreDispatchType } from '../redux';
import { paths } from '../routers/paths';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { api } from '../api/api';
import { ReactComponent as MailIcon } from '../icons/mail_icon.svg';
import { ReactComponent as MailIconChecked } from '../icons/mail_icon_checked.svg';
import css from './VerifyEmailPage.module.scss';

const classes = classNames.bind(css);

export const VerifyEmailPage = requireLogin(({ userInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
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
          setErrorMessage(res.payload?.message ?? 'Something went wrong');
        }
      })
      .finally(() => setIsLoading(false));
  }, [verificationId, userInfo, dispatch, history]);

  if (!userInfo.emailVerified)
    return (
      <div>
        <div>{errorMessage || 'Verifying email'}</div>
        {isLoading && <LoadingSpinner />}
      </div>
    );
  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>Email verified</h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <div className={classes(css.formSubtitle)}>
            Your email {userInfo.email} has now been verified
          </div>
          <MailIconChecked className={classes(css.icon)} />
          <div className={classes(css.centered)}>
            <strong>All done!</strong> You can now go explore your projects.
          </div>
          <Link
            className={classes(css['button-large'], css.centered)}
            to={paths.overview}
          >
            Go to my projects
          </Link>
          <div className={classes(css.formFooter)}>
            Explore later? <Link to={paths.logoutPage}>Log out</Link>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
});

export const EmailVerificationPage = requireLogin(({ userInfo }) => {
  const [sending, setSending] = useState(false);
  const sendLink = () => {
    setSending(true);
    api.sendEmailVerificationLink(userInfo).finally(() => setSending(false));
  };
  const linkValid = false; // TODO
  const linkSent = 'dd.MM.YY'; // TODO
  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2>Verify email address</h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <div className={classes(css.formSubtitle)}>
            Before your journey in Visdom, we need to verify your email address.
          </div>
          <MailIcon className={classes(css.icon)} />
          {linkValid ? (
            <div>
              We have sent an email to <strong>{userInfo.email}</strong> on{' '}
              <strong>{linkSent}</strong> for you to verify your email address
              using the verification link in the email.
            </div>
          ) : (
            <div>
              We will soon send an email to <strong>{userInfo.email}</strong>{' '}
              for you to verify your email address using the verification link
              in the email.
            </div>
          )}
          <button
            className={classes(css['button-large'])}
            type="submit"
            tabIndex={0}
            disabled={sending}
            onClick={sendLink}
          >
            Resend email
          </button>
          <div className={classes(css.formFooter)}>
            Wrong email address? <a href="TODO">Change address</a>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
});
