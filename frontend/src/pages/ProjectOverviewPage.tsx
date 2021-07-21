import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import ControlPointSharpIcon from '@material-ui/icons/ControlPointSharp';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import {
  roadmapsSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { ProjectSummary } from '../components/ProjectSummary';
import css from './ProjectOverviewPage.module.scss';

const classes = classNames.bind(css);

export const ProjectOverviewPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );
  const chosenRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, roadmaps]);

  useEffect(() => {
    if (chosenRoadmap) {
      setSelectedRoadmapId(chosenRoadmap.id);
    }
  }, [chosenRoadmap]);

  const addRoadmapClicked = (
    e: React.MouseEvent<any, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={classes(css.projectOverview)}>
      <h2>
        <Trans i18nKey="Your projects" />
      </h2>
      <div className={classes(css.roadmapsContainer)}>
        {roadmaps?.map((roadmap) => (
          <ProjectSummary
            roadmap={roadmap}
            selected={selectedRoadmapId === roadmap.id}
            key={roadmap.id}
          />
        ))}
        <div
          className={classes(css.addRoadmap)}
          role="button"
          onClick={addRoadmapClicked}
          onKeyPress={addRoadmapClicked}
          tabIndex={0}
        >
          <ControlPointSharpIcon />
          <Trans i18nKey="Add project" />
        </div>
      </div>
    </div>
  );
};
