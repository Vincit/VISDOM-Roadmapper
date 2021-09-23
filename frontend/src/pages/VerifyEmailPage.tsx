import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { paths } from '../routers/paths';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { requireLogin } from '../utils/requirelogin';
import { StoreDispatchType } from '../redux';
import { userActions } from '../redux/user';

export const VerifyEmailPage = requireLogin(({ userInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { verificationId } = useParams<{
    verificationId: string | undefined;
  }>();

  useEffect(() => {
    if (userInfo.emailVerified) {
      history.push(paths.getStarted);
      return;
    }
    if (!verificationId) return;

    setIsLoading(true);
    dispatch(userActions.verifyEmail({ user: userInfo, verificationId }))
      .then((res) => {
        if (userActions.verifyEmail.rejected.match(res)) {
          setErrorMessage(res.payload?.message ?? 'Something went wrong');
        }
      })
      .finally(() => setIsLoading(false));
  }, [verificationId, userInfo, dispatch, history]);

  return (
    <div>
      <div>{errorMessage || 'Verifying email'}</div>
      {isLoading && <LoadingSpinner />}
    </div>
  );
});
