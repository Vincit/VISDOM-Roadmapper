import React, { useEffect, useRef, useState } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import {
  roadmapsSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { paths } from '../routers/paths';
import { StyledNavDropdown } from './forms/StyledNavDropdown';

export const RoadmapSelectorWidget = () => {
  const dropdownRef = useRef<HTMLDivElement>();
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );

  const chosenRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [selectedRoadmap, setSelectedRoadmap] = useState<String>(
    'Select roadmap',
  );

  useEffect(() => {
    if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, roadmaps]);

  useEffect(() => {
    if (chosenRoadmap) setSelectedRoadmap(chosenRoadmap.name);
  }, [chosenRoadmap]);

  const toggleDropdown = () => {
    dropdownRef!.current!.click();
  };

  return (
    <StyledNavDropdown
      id="roadmapselector"
      title={selectedRoadmap}
      ref={dropdownRef}
    >
      {!roadmaps || roadmaps.length === 0 ? (
        <NavDropdown.Item>No roadmaps available</NavDropdown.Item>
      ) : (
        <>
          {roadmaps &&
            roadmaps.map((roadmap) => (
              <Link
                key={roadmap.id}
                className="dropdown-item"
                to={`${paths.roadmapHome}/${roadmap.id}/dashboard`}
                onClick={toggleDropdown} // Close dropdown manually because clicking on react <Link> does not close it
              >
                {roadmap.name}
              </Link>
            ))}
        </>
      )}
    </StyledNavDropdown>
  );
};
