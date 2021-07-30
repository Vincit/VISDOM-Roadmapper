import { MouseEvent, useState, useEffect } from 'react';
import classNames from 'classnames';
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
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { ProjectSummary } from '../components/ProjectSummary';
import { AddButton } from '../components/forms/AddButton';
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

  const addRoadmapClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_ROADMAP_MODAL,
        modalProps: {},
      }),
    );
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
        <div className={classes(css.addButtonContainer)}>
          <AddButton onClick={addRoadmapClicked}>
            <Trans i18nKey="Add project" />
          </AddButton>
        </div>
      </div>
    </div>
  );
};
