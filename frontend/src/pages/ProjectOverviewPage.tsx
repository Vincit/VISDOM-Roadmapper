import { MouseEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { ProjectSummary } from '../components/ProjectSummary';
import { AddButton } from '../components/forms/AddButton';
import { requireVerifiedEmail } from '../utils/requirelogin';
import css from './ProjectOverviewPage.module.scss';

const classes = classNames.bind(css);

export const ProjectOverviewComponent = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!roadmaps) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, roadmaps]);

  useEffect(() => {
    dispatch(roadmapsActions.clearCurrentRoadmap());
    dispatch(roadmapsActions.clearTaskmapPosition());
  }, [dispatch]);

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
          <ProjectSummary roadmap={roadmap} key={roadmap.id} />
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

export const ProjectOverviewPage = requireVerifiedEmail(
  ProjectOverviewComponent,
);
