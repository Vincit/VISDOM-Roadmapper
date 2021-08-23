import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { userActions } from '../redux/user';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { requireLogin } from '../utils/requirelogin';

export const JoinRoadmapPageComponent = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { invitationLink } = useParams<{
    invitationLink: string | undefined;
  }>();

  useEffect(() => {
    if (!invitationLink || !userInfo) return;

    setIsLoading(true);
    dispatch(userActions.joinRoadmap({ user: userInfo, invitationLink })).then(
      (res) => {
        setIsLoading(false);
        if (userActions.joinRoadmap.rejected.match(res)) {
          if (res.payload) setErrorMessage(res.payload.message);
          return;
        }
        history.push(
          `${paths.roadmapHome}/${res.payload.roadmapId}${paths.roadmapRelative.dashboard}`,
        );
      },
    );
  }, [dispatch, history, invitationLink, userInfo]);

  return (
    <div>
      {errorMessage ? <div>{errorMessage}</div> : <div>Joining roadmap</div>}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export const JoinRoadmapPage = requireLogin(JoinRoadmapPageComponent);
