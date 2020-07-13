import React, { useEffect, useRef } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
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

  useEffect(() => {
    if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, roadmaps]);

  const toggleDropdown = () => {
    dropdownRef!.current!.click();
  };

  return (
    <StyledNavDropdown
      id="roadmapselector"
      title="Select roadmap"
      ref={dropdownRef}
    >
      {!roadmaps || roadmaps.length === 0 ? (
        <NavDropdown.Item>No roadmaps available</NavDropdown.Item>
      ) : (
        <>
          {roadmaps &&
            roadmaps.map((roadmap) => (
              <Link
                className="dropdown-item"
                to={`${paths.roadmapHome}/${roadmap.id}`}
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
