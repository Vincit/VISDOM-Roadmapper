import React from 'react';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { PublicUser } from '../redux/roadmaps/types';
import { StyledTd } from './CommonLayoutComponents';
import { StyledButton } from './forms/StyledButton';

interface TableUserRowProps {
  user: PublicUser;
}

export const TableUserRow: React.FC<TableUserRowProps> = ({ user }) => {
  const { username, customerValue } = user;
  const dispatch = useDispatch<StoreDispatchType>();

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
        <StyledButton buttonType="ratenow" onClick={() => rateUser()}>
          Rate
        </StyledButton>
      </StyledTd>
    </tr>
  );
};
