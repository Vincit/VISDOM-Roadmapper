import { useState, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Search } from 'react-bootstrap-icons';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { CustomerList } from '../components/CustomerListTable';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { RootState } from '../redux/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { getType } from '../utils/UserUtils';
import { RoleType } from '../../../shared/types/customTypes';
import css from './PeopleListPage.module.scss';

const classes = classNames.bind(css);

export const ClientsListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const role = getType(userInfo?.roles, currentRoadmap?.id);

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
  };

  const addCustomerClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_CUSTOMER_MODAL,
        modalProps: {},
      }),
    );
  };

  const Topbar = () => (
    <div className="topBar">
      <div className="searchBarContainer">
        <input
          className="search"
          placeholder={t('Search for clients')}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
        />
        <Search />
      </div>
      {role === RoleType.Admin && (
        <div className={classes(css.rightSide)}>
          <button
            className={classes(css['button-small-filled'])}
            type="button"
            onClick={addCustomerClicked}
          >
            + <Trans i18nKey="Add new client" />
          </button>
        </div>
      )}
    </div>
  );
  return (
    <>
      {Topbar()}
      <div>
        <CustomerList search={searchString} role={role!} />
      </div>
    </>
  );
};
