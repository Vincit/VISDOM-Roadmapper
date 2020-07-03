import React, { useEffect, useState } from 'react';
import { Form, Col } from 'react-bootstrap';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { roadmapsActions } from '../redux/roadmaps';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { Roadmap } from '../redux/roadmaps/types';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { LoadingSpinner } from '../components/LoadingSpinner';
import styled from 'styled-components';

const Styles = styled.div`
  .roadmapWidget {
    width: 50%;
    margin: auto;
    align-content: center;
    padding: 0.5rem;
  }
`;

export const RoadmapHomePage = () => {
  const { url } = useRouteMatch();
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[]>(
    roadmapsSelector,
    shallowEqual,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const history = useHistory();

  useEffect(() => {
    dispatch(roadmapsActions.getRoadmaps()).then(() => setIsLoaded(true));
  }, [dispatch]);

  const roadmapPickerWidget = () => {
    return (
      <>
      <Styles>
        <div>Please select a roadmap.</div>

        <div className="roadmapWidget">
          <Form className="w-100">
              <Form.Row>
                <Col>
                  <Form.Control
                    required
                    as="select"
                    onChange={(e) => {
                      let selectedValue = e.currentTarget.value;
                      let selectedRoadmapId = selectedValue ? parseInt(selectedValue, 10) : '';
                      history.push(url + selectedRoadmapId);
                    }}
                    value={'-1'}
                  >
                    <option key='-1' value=''> </option>
                    {roadmaps.map((roadmap) => (
                      <option key={roadmap.id} value={roadmap.id}>{roadmap.name}</option>
                    ))}
                  </Form.Control>
                </Col>
              </Form.Row>
          </Form>
        </div>
      </Styles>
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
