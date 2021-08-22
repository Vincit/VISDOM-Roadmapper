import { Redirect } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { UserInfo } from '../redux/user/types';
import { userInfoSelector } from '../redux/user/selectors';

export const HomePage = () => {
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  if (!roadmaps || !userInfo) return <LoadingSpinner />;

  if (userInfo.defaultRoadmapId) {
    const match = roadmaps.some((map) => map.id === userInfo.defaultRoadmapId);
    if (match) {
      return (
        <Redirect
          to={`${paths.roadmapHome}/${userInfo.defaultRoadmapId}${paths.roadmapRelative.dashboard}`}
        />
      );
    }
  }

  return roadmaps.length > 0 ? (
    <Redirect to={paths.overview} />
  ) : (
    <Redirect to={paths.getStarted} />
  );
};
