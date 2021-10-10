import { useState, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Search } from 'react-bootstrap-icons';
import { useDispatch } from 'react-redux';
import { modalsActions } from '../redux/modals';
import { StoreDispatchType } from '../redux/index';
import { ModalTypes } from '../components/modals/types';
import { TeamMemberList } from '../components/TeamMemberListTable';
import css from './PeopleListPage.module.scss';

const classes = classNames.bind(css);

export const PeopleListPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [searchString, setSearchString] = useState('');

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
  };

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

  const Topbar = () => (
    <div className="topBar">
      <div className="searchBarContainer">
        <input
          className="search"
          placeholder={t('Search for people')}
          onChange={(e: any) => onSearchChange(e.currentTarget.value)}
        />
        <Search />
      </div>
      <div className={classes(css.rightSide)}>
        <button
          className="button-small-filled"
          type="button"
          onClick={addTeamMemberClicked}
        >
          + <Trans i18nKey="Add new team member" />
        </button>
      </div>
    </div>
  );
  return (
    <>
      {Topbar()}
      <div>
        <TeamMemberList search={searchString} />
      </div>
    </>
  );
};
