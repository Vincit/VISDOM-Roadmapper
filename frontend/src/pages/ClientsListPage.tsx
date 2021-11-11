import { useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { CustomerList } from '../components/CustomerListTable';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { StoreDispatchType } from '../redux/index';
import { RootState } from '../redux/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { getType } from '../utils/UserUtils';
import { TopBar } from '../components/TopBar';

export const ClientsListPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [searchString, setSearchString] = useState('');
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const role = getType(userInfo, currentRoadmap?.id);

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

  return (
    <>
      <TopBar
        searchType={t('clients')}
        addType={t('client')}
        onSearchChange={(value) => setSearchString(value)}
        onAddClick={addCustomerClicked}
      />
      <div>
        <CustomerList search={searchString} role={role!} />
      </div>
    </>
  );
};
