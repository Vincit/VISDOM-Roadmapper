import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { Customer } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import '../shared.scss';

interface TableRowProps {
  customer: Customer;
}

export const TableCustomerRow: React.FC<TableRowProps> = ({ customer }) => {
  const { id, name, value } = customer;
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const rateCustomer = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_CUSTOMER_MODAL,
        modalProps: {
          customerId: id,
        },
      }),
    );
  };

  return (
    <tr>
      <td className="styledTd">{name}</td>
      <td className="styledTd">{value}</td>
      <td className="styledTd nowrap textAlignEnd">
        {userInfo!.type === UserType.AdminUser && (
          <button
            className="button-small-filled"
            type="button"
            onClick={rateCustomer}
          >
            Rate
          </button>
        )}
      </td>
    </tr>
  );
};
