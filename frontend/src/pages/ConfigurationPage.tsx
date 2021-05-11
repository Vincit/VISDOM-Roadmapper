import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import { requireLogin } from '../utils/requirelogin';
import css from './ConfigurationPage.module.scss';

const classes = classNames.bind(css);

const RoadmapConfigurationPageComponent = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  const onJiraConfigurationClick = (e: any) => {
    e.preventDefault();

    if (currentRoadmap.jiraconfiguration) {
      dispatch(
        modalsActions.showModal({
          modalType: ModalTypes.EDIT_JIRA_CONFIGURATION_MODAL,
          modalProps: {
            jiraconfigurationId: currentRoadmap.jiraconfiguration.id,
          },
        }),
      );
    } else {
      dispatch(
        modalsActions.showModal({
          modalType: ModalTypes.ADD_JIRA_CONFIGURATION_MODAL,
          modalProps: {
            roadmap: currentRoadmap,
          },
        }),
      );
    }
  };

  const onOAuthClick = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.SETUP_OAUTH_MODAL,
        modalProps: { roadmapId: currentRoadmap.id },
      }),
    );
  };

  const openTokenModal = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.USER_AUTH_TOKEN_MODAL,
        modalProps: {},
      }),
    );
  };

  return (
    <>
      This is the roadmap configuration page.
      {userInfo?.type === UserType.AdminUser && (
        <>
          <div className={classes(css.layoutRow)}>
            <span className={classes(css.columnHeader)}>
              {currentRoadmap.name} <Trans i18nKey="jiraconfiguration" />
              <br />
              <button
                className={classes(css['button-small-filled'])}
                type="submit"
                onClick={onJiraConfigurationClick}
              >
                + <Trans i18nKey="Configure Jira" />
              </button>
            </span>
          </div>
          <div className={classes(css.layoutRow)}>
            <span className={classes(css.columnHeader)}>
              {currentRoadmap.name} <Trans i18nKey="authentication" />
              <br />
              <button
                className={classes(css['button-small-filled'])}
                type="submit"
                onClick={onOAuthClick}
              >
                + <Trans i18nKey="OAuth" />
              </button>
            </span>
          </div>
        </>
      )}
      <div className={classes(css.layoutRow)}>
        <span className={classes(css.columnHeader)}>
          <Trans i18nKey="Personal auth token" />
          <br />
          <button
            className="button-small-filled"
            type="submit"
            onClick={openTokenModal}
          >
            + <Trans i18nKey="Manage" />
          </button>
        </span>
      </div>
    </>
  );
};

export const ConfigurationPage = requireLogin(
  RoadmapConfigurationPageComponent,
);
