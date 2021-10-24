import { useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { modalsActions } from '../redux/modals';
import { StoreDispatchType } from '../redux/index';
import { ModalTypes } from '../components/modals/types';
import { TeamMemberList } from '../components/TeamMemberListTable';
import { TopBar } from '../components/TopBar';

export const TeamListPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [searchString, setSearchString] = useState('');

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
    </>
  );
};
