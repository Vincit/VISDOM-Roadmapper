import { useState, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { modalsActions } from '../redux/modals';
import { StoreDispatchType } from '../redux/index';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { ModalTypes } from '../components/modals/types';
import { TeamMemberList } from '../components/TeamMemberListTable';
import { InvitationList } from '../components/InvitationListTable';
import { TopBar } from '../components/TopBar';
import css from './TeamListPage.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const TeamListPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [searchString, setSearchString] = useState('');
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: invitations } = apiV2.useGetInvitationsQuery(
    roadmapId ?? skipToken,
  );

  const addTeamMemberClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_TEAM_MEMBER_MODAL,
        modalProps: {},
      }),
    );
  };

  return (
    <>
      <TopBar
        searchType={t('members')}
        addType={t('team member')}
        onSearchChange={(value) => setSearchString(value)}
        onAddClick={addTeamMemberClicked}
      />
      <div>
        <TeamMemberList search={searchString} />
      </div>
      <div className={classes(css.invitationList)}>
        {invitations && invitations.length > 0 && (
          <InvitationList search={searchString} invitations={invitations} />
        )}
      </div>
    </>
  );
};
