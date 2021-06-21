import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { DeleteButton } from './forms/DeleteButton';
import { EditButton } from './forms/EditButton';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import {
  customerWeightSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { getType } from '../utils/UserUtils';
import css from './TableCustomerRow.module.scss';

const classes = classNames.bind(css);

interface TableRowProps {
  customer: Customer;
}

export const TableCustomerRow: React.FC<TableRowProps> = ({ customer }) => {
  const { id, name, color } = customer;
  const weight = useSelector<RootState, number>(
    customerWeightSelector(customer),
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const deleteUserClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_PEOPLE_MODAL,
        modalProps: {
          userId: id,
          userName: name,
          type: 'customer',
        },
      }),
    );
  };

  const editUserClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_CUSTOMER_MODAL,
        modalProps: {
          customer,
        },
      }),
    );
  };

  return (
    <tr>
      <td className="styledTd">
        <div
          className={classes(css.customerCircle)}
          style={{ backgroundColor: color }}
        />
      </td>
      <td className="styledTd">{name}</td>
      <td className="styledTd">{weight}</td>
      <td className="styledTd nowrap textAlignEnd">
        {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin && (
          <div className={classes(css.editCustomer)}>
            <div>
              <EditButton
                type="default"
                onClick={editUserClicked}
                href={`?openModal=${
                  ModalTypes.EDIT_CUSTOMER_MODAL
                }&modalProps=${encodeURIComponent(JSON.stringify(customer))}`}
              />
              <DeleteButton
                type="filled"
                onClick={deleteUserClicked}
                href={`?openModal=${
                  ModalTypes.REMOVE_PEOPLE_MODAL
                }&modalProps=${encodeURIComponent(
                  JSON.stringify({
                    userId: id,
                    userName: name,
                    type: 'customer',
                  }),
                )}`}
              />
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};
