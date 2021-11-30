import classNames from 'classnames';
import { useState } from 'react';
import { UserInfoCard } from '../components/UserInfoCard';
import { requireLogin } from '../utils/requirelogin';
import { api } from '../api/api';
import css from './UserInfoPage.module.scss';

const classes = classNames.bind(css);

export const UserInfoPage = requireLogin(({ userInfo }) => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  return (
    <div className={classes(css.container)}>
      {!userInfo.emailVerified && (
        <div>
          Please verify your email.
          <br />
          Click{' '}
          <button
            className="linkButton blue"
            tabIndex={0}
            type="button"
            disabled={sent || sending}
            onClick={async () => {
              setSending(true);
              setSent(await api.sendEmailVerificationLink(userInfo));
              setSending(false);
            }}
          >
            here
          </button>{' '}
          to send a new verifiation link, if you have not yet received one.
        </div>
      )}
      <UserInfoCard userInfo={userInfo} />
    </div>
  );
});
