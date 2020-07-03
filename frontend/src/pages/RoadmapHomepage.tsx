import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RoadmapSelectorWidget } from '../components/RoadmapSelectorWidget';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';

export const RoadmapHomePage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(roadmapsActions.getRoadmaps()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      {isLoaded ? (
        <>
          {roadmaps && roadmaps.length > 0 ? (
            <Col>
              Please select a roadmap
              <RoadmapSelectorWidget />
            </Col>
          ) : (
            'No roadmaps available'
          )}
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};
