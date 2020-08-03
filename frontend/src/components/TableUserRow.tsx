import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { PublicUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import { StyledTd } from './CommonLayoutComponents';
import { StyledButton } from './forms/StyledButton';

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
      <StyledTd>{username}</StyledTd>
      <StyledTd>{customerValue}</StyledTd>
      <StyledTd textAlign="end" nowrap>
        {userInfo!.type === UserType.AdminUser && (
          <StyledButton buttonType="ratenow" onClick={() => rateUser()}>
            Rate
          </StyledButton>
        )}
      </StyledTd>
    </tr>
  );
};
