import React from 'react';
import { Redirect } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { paths } from '../routers/paths';

const PlaceholderComponent = () => {
  return <div> No Projects yet. </div>;
};

export const HomePage = () => {
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );

  if (roadmaps && localStorage.getItem('chosenRoadmap')) {
    const previousRoadmap = JSON.parse(
      localStorage.getItem('chosenRoadmap') ?? '{}',
    );

    const match = roadmaps.find((map) => map.id === previousRoadmap.id);
    if (match) {
      return (
        <Redirect to={`${paths.roadmapHome}/${previousRoadmap.id}/dashboard`} />
      );
    }
  }

  return roadmaps && roadmaps.length > 0 ? (
    <Redirect to={`${paths.roadmapHome}/${roadmaps[0].id}/dashboard`} />
  ) : (
    <PlaceholderComponent />
  );
};
