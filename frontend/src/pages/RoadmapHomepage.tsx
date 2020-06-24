import React, { useEffect, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { roadmapsActions } from '../redux/roadmaps';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { Roadmap } from '../redux/roadmaps/types';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const RoadmapHomePage = () => {
  const { url } = useRouteMatch();
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[]>(
    roadmapsSelector,
    shallowEqual,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(roadmapsActions.getRoadmaps()).then(() => setIsLoaded(true));
  }, [dispatch]);

  const roadmapPickerWidget = () => {
    return (
      <>
        <div>Please select a roadmap.</div>
        {roadmaps.map((roadmap) => (
          <Link to={url + roadmap.id}>{roadmap.description}</Link>
        ))}
        ;
      </>
    );
  };

  return (
    <>
      {isLoaded ? (
        <>
          {roadmaps.length > 0
            ? roadmapPickerWidget()
            : 'No roadmaps available'}
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};
