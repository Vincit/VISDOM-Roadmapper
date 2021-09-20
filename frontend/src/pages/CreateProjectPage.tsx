import React from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { paths } from '../routers/paths';
import { ModalContent } from '../components/modals/modalparts/ModalContent';
import { ModalHeader } from '../components/modals/modalparts/ModalHeader';
import { Footer } from '../components/Footer';
import { RootState } from '../redux/types';
import css from './CreateProjectPage.module.scss';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { Roadmap } from '../redux/roadmaps/types';
import { roadmapsSelector } from '../redux/roadmaps/selectors';
import { requireLogin } from '../utils/requirelogin';

const classes = classNames.bind(css);

export const CreateProjectPage = requireLogin(({ userInfo }) => {
  const { t } = useTranslation();
  const roadmaps = useSelector<RootState, Roadmap[] | undefined>(
    roadmapsSelector,
    shallowEqual,
  );
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
      <div className={classes(css.container)}>
        <ModalHeader>
          <h2> {t('Greet user', { username: userInfo.username })} </h2>
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.formSubtitle)}>
            <Trans i18nKey="No projects yet" />
          </div>
          <div className={classes(css.body)}>
            <Trans i18nKey="First project info 1/2" />
          </div>
          <div className={classes(css.body)}>
            <Trans i18nKey="First project info 2/2" />
          </div>
          <button
            className={classes(css.button)}
            type="submit"
            onClick={addRoadmapClicked}
          >
            <Trans i18nKey="Create a new project" />
          </button>
          <div className={classes(css.footer)}>
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
