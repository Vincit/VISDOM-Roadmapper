import { useState, useEffect, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { modalsActions } from '../redux/modals';
import { StoreDispatchType } from '../redux/index';
import { allInvitationsSelector } from '../redux/roadmaps/selectors';
import { Invitation } from '../redux/roadmaps/types';
import { roadmapsActions } from '../redux/roadmaps';
import { RootState } from '../redux/types';
import { ModalTypes } from '../components/modals/types';
import { TeamMemberList } from '../components/TeamMemberListTable';
import { InvitationList } from '../components/InvitationListTable';
import { TopBar } from '../components/TopBar';
import css from './TeamListPage.module.scss';

const classes = classNames.bind(css);

export const TeamListPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [searchString, setSearchString] = useState('');
  const invitations = useSelector<RootState, Invitation[] | undefined>(
    allInvitationsSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!invitations) dispatch(roadmapsActions.getInvitations());
  }, [dispatch, invitations]);

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
