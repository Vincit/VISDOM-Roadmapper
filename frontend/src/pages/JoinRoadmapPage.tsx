import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { userActions } from '../redux/user';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { requireLogin } from '../utils/requirelogin';

export const JoinRoadmapPageComponent = ({
  userInfo,
}: {
  userInfo: UserInfo;
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { invitationLink } = useParams<{
    invitationLink: string | undefined;
  }>();

  useEffect(() => {
    if (!invitationLink) return;

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
