import { FC, MouseEvent, useState, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { DeleteButton, EditButton } from './forms/SvgButton';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from './modals/types';
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
import { unratedTasksAmount } from '../utils/TaskUtils';
import css from './TableCustomerRow.module.scss';
import { Dot } from './Dot';

const classes = classNames.bind(css);

interface TableRowProps {
  customer: Customer;
}

export const TableCustomerRow: FC<TableRowProps> = ({ customer }) => {
  const { id, name, email, color } = customer;
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
  const [unratedAmount, setUnratedAmount] = useState(0);

  useEffect(() => {
    if (currentRoadmap?.tasks)
      setUnratedAmount(unratedTasksAmount(customer, currentRoadmap));
  }, [currentRoadmap, customer]);

  const deleteUserClicked = (e: MouseEvent) => {
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

  const editUserClicked = (e: MouseEvent) => {
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
    <tr className={classes(css.styledTr)}>
      <td className={classes(css.styledTd)}>
        <Dot fill={color} />
      </td>
      <td className="styledTd">{name}</td>
      <td className="styledTd">
        <a className="green" href={`mailto:${email}`}>
          {email}
        </a>
      </td>
      <td className="styledTd">{weight}</td>
      <td className="styledTd">
        <b>{unratedAmount || ' '}</b>
      </td>
      <td className="styledTd nowrap textAlignEnd">
        {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin && (
          <div className={classes(css.editCustomer)}>
            <div>
              <EditButton
                fontSize="medium"
                onClick={editUserClicked}
                href={modalLink(ModalTypes.EDIT_CUSTOMER_MODAL, { customer })}
              />
              <DeleteButton
                type="filled"
                onClick={deleteUserClicked}
                href={modalLink(ModalTypes.REMOVE_PEOPLE_MODAL, {
                  userId: id,
                  userName: name,
                  type: 'customer',
                })}
              />
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};
