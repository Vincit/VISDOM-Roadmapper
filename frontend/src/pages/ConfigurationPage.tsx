import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LayoutRow } from '../components/CommonLayoutComponents';
import { StyledButton } from '../components/forms/StyledButton';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../redux/modals/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import { requireLogin } from '../utils/requirelogin';

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
        modalProps: {},
      }),
    );
  };

  const ColumnHeader = styled.span`
    text-align: left;
    border-bottom: 1px solid black;
    font-size: 24px;
    line-height: 32px;
    font-weight: bold;
    padding-top: 16px;
    padding-bottom: 24px;
  `;

  return (
    <>
      This is the roadmap configuration page.
      {userInfo!.type === UserType.AdminUser && (
        <LayoutRow>
          <ColumnHeader>
            {currentRoadmap.name} <Trans i18nKey="jiraconfiguration" />
            <br />
            <StyledButton
              buttonType="submit"
              onClick={onJiraConfigurationClick}
            >
              + <Trans i18nKey="Configure Jira" />
            </StyledButton>
          </ColumnHeader>
        </LayoutRow>
      )}
      <LayoutRow>
        <ColumnHeader>
          {currentRoadmap.name} <Trans i18nKey="authentication" />
          <br />
          <StyledButton buttonType="submit" onClick={onOAuthClick}>
            + <Trans i18nKey="OAuth" />
          </StyledButton>
        </ColumnHeader>
      </LayoutRow>
    </>
  );
};

export const ConfigurationPage = requireLogin(
  RoadmapConfigurationPageComponent,
);
