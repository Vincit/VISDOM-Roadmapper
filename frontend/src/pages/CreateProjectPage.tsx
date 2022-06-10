import React from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { paths } from '../routers/paths';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import css from './CreateProjectPage.module.scss';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const CreateProjectPage = requireVerifiedEmail(({ userInfo }) => {
  const { data: roadmaps } = apiV2.useGetRoadmapsQuery();
  const dispatch = useDispatch<StoreDispatchType>();

  const addRoadmapClicked = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_ROADMAP_MODAL,
        modalProps: {},
      }),
    );
  };

  if (roadmaps && roadmaps.length > 0)
    return <Redirect to={`${paths.roadmapHome}/${roadmaps[0].id}/dashboard`} />;

  return (
    <>
      <div className={classes(css.formDiv)}>
        <ModalHeader>
          <h2 className={classes(css.createProjectHeader)}>
            <Trans i18nKey="Greet user" values={{ email: userInfo.email }}>
              <div>Hey, </div>
              <div>{userInfo.email}</div>
            </Trans>
          </h2>
        </ModalHeader>
        <ModalContent gap={50}>
          <div className={classes(css.formSubtitle)}>
            <Trans i18nKey="No projects yet" />
          </div>
          <div className={classes(css.body)}>
            <p>
              <Trans i18nKey="First project info 1/2" />
            </p>
            <p>
              <Trans i18nKey="First project info 2/2" />
            </p>
          </div>
          <button
            className={classes(css['button-large'])}
            type="submit"
            onClick={addRoadmapClicked}
          >
            <Trans i18nKey="Create a new project" />
          </button>
          <div className={classes(css.formFooter)}>
            <Trans i18nKey="Problems in joining a project?" />{' '}
            <a href="mailto:visdom@vincit.fi">
              <Trans i18nKey="Contact us" />
            </a>
          </div>
        </ModalContent>
      </div>
      <Footer />
    </>
  );
});
