import { MouseEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { ProjectSummary } from '../components/ProjectSummary';
import { AddButton } from '../components/forms/AddButton';
import { requireVerifiedEmail } from '../utils/requirelogin';
import css from './ProjectOverviewPage.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const ProjectOverviewComponent = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { data: roadmaps } = apiV2.useGetRoadmapsQuery();
  const sortedRoadmaps = [...(roadmaps || [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

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
        {sortedRoadmaps?.map((roadmap) => (
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
