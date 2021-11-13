import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import {
  roadmapsSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { paths } from '../routers/paths';
import { Dropdown } from './forms/Dropdown';
import css from './RoadmapSelectorWidget.module.scss';

const classes = classNames.bind(css);

export const RoadmapSelectorWidget = () => {
  const history = useHistory();
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );

  const chosenRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [selectedRoadmap, setSelectedRoadmap] = useState<string>(
    'Select roadmap',
  );

  useEffect(() => {
    if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, roadmaps]);

  useEffect(() => {
    if (chosenRoadmap) {
      setSelectedRoadmap(chosenRoadmap.name);
    } else setSelectedRoadmap('Select roadmap');
  }, [chosenRoadmap]);

  if (!roadmaps)
    return <Dropdown css={css} title="No roadmaps available" disabled empty />;

  if (roadmaps.length === 0) {
    return (
      <div className={classes(css.dropContainer)}>
        <button
          type="button"
          className={classes(css.dropButton)}
          onClick={() => history.push(paths.getStarted)}
        >
          <div className={classes(css.dropTitle)}>Get started</div>
        </button>
      </div>
    );
  }

  return (
    <Dropdown css={css} title={selectedRoadmap} maxLength={21}>
      {roadmaps.map((roadmap) => (
        <Link
          key={roadmap.id}
          className={classes(css.dropItem)}
          onClick={() => dispatch(roadmapsActions.clearTaskmapPosition())}
          to={`${paths.roadmapHome}/${roadmap.id}${paths.roadmapRelative.dashboard}`}
        >
          {roadmap.name}
        </Link>
      ))}
    </Dropdown>
  );
};
