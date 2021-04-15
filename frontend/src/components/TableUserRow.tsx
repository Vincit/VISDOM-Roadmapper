import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { PublicUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import '../shared.scss';

interface TableUserRowProps {
  user: PublicUser;
}

export const TableUserRow: React.FC<TableUserRowProps> = ({ user }) => {
  const { username, customerValue } = user;
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const rateUser = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_USER_MODAL,
        modalProps: {
          userId: user.id,
        },
      }),
    );
  };

  return (
    <tr>
      <td className="styledTd">{username}</td>
      <td className="styledTd">{customerValue}</td>
      <td className="styledTd nowrap textAlignEnd">
        {userInfo!.type === UserType.AdminUser && (
          <button
            className="button-small-filled"
            type="button"
            onClick={() => rateUser()}
          >
            Rate
          </button>
        )}
      </td>
    </tr>
  );
};
