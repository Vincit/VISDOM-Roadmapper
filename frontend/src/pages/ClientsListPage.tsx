import { useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { CustomerList } from '../components/CustomerListTable';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { StoreDispatchType } from '../redux/index';
import { userRoleSelector } from '../redux/user/selectors';
import { TopBar } from '../components/TopBar';
import { RoleType } from '../../../shared/types/customTypes';

export const ClientsListPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [searchString, setSearchString] = useState('');
  const role = useSelector(userRoleSelector, shallowEqual);

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
        showAddButtonsToRoles={[RoleType.Admin]}
      />
      <div>
        <CustomerList search={searchString} role={role!} />
      </div>
    </>
  );
};
