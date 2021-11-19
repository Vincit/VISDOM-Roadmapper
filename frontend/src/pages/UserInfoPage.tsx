import { useState } from 'react';
import { UserInfoCard } from '../components/UserInfoCard';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { api } from '../api/api';

export const UserInfoPage = requireVerifiedEmail(({ userInfo }) => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  return (
    <div>
      This is the user info page.
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
