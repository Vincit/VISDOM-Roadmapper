import React, { useEffect } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { paths } from '../routers/paths';
import { StyledNavDropdown } from './forms/StyledNavDropdown';

export const RoadmapSelectorWidget = () => {
  const history = useHistory();
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, roadmaps]);

  const selectRoadmap = (id: number) => {
    history.push(`${paths.roadmapHome}/${id}`);
  };

  return (
    <StyledNavDropdown id="roadmapselector" title="Select roadmap">
      {!roadmaps || roadmaps.length === 0 ? (
        <NavDropdown.Item>No roadmaps available</NavDropdown.Item>
      ) : (
        <>
          {roadmaps &&
            roadmaps.map((roadmap) => (
              <NavDropdown.Item onClick={() => selectRoadmap(roadmap.id)}>
                {roadmap.name}
              </NavDropdown.Item>
            ))}
        </>
      )}
    </StyledNavDropdown>
  );
};
