import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { PublicUser } from '../redux/roadmaps/types';
import { StyledButton } from './forms/StyledButton';

interface TableUserRowProps {
  user: PublicUser;
}

const UserTd = styled.td<{
  clickable?: boolean;
  rightalign?: boolean;
  nowrap?: boolean;
}>`
  vertical-align: middle !important;
  max-width: 30em;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'inherit')};
  text-align: ${(props) => (props.rightalign ? 'end' : 'center')};
  white-space: ${(props) => (props.nowrap ? 'nowrap' : 'inherit')};
`;

export const TableUserRow: React.FC<TableUserRowProps> = ({ user }) => {
  const { username, customerValue } = user;
  const dispatch = useDispatch<StoreDispatchType>();

  const rateUser = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_USER_MODAL,
        modalProps: {
          user,
        },
      }),
    );
  };

  return (
    <tr>
      <UserTd>{username}</UserTd>
      <UserTd>{customerValue}</UserTd>
      <UserTd rightalign nowrap>
        <StyledButton buttonType="ratenow" onClick={() => rateUser()}>
          Rate
        </StyledButton>
      </UserTd>
    </tr>
  );
};
