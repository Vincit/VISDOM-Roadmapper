import { Redirect } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HomePage = () => {
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );

  if (!roadmaps) return <LoadingSpinner />;

  return roadmaps.length > 0 ? (
    <Redirect to={`${paths.roadmapHome}/${roadmaps[0].id}/dashboard`} />
  ) : (
    <Redirect to="/getstarted" />
  );
};
