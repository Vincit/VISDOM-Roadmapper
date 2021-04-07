import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
import css from './forms/Dropdown.module.scss';

const classes = classNames.bind(css);

export const RoadmapSelectorWidget = () => {
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
    if (chosenRoadmap) setSelectedRoadmap(chosenRoadmap.name);
  }, [chosenRoadmap]);

  if (!roadmaps || roadmaps.length === 0) {
    return <Dropdown title="No roadmaps available" disabled />;
  }

  return (
    <Dropdown title={selectedRoadmap}>
      {roadmaps &&
        roadmaps.map((roadmap) => (
          <Link
            key={roadmap.id}
            className={classes(css.dropItem)}
            to={`${paths.roadmapHome}/${roadmap.id}/dashboard`}
          >
            {roadmap.name}
          </Link>
        ))}
    </Dropdown>
  );
};
