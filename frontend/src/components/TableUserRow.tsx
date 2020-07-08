import React from 'react';
import styled from 'styled-components';
import { PublicUser } from '../redux/roadmaps/types';

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

  return (
    <tr>
      <UserTd>{username}</UserTd>
      <UserTd>{customerValue}</UserTd>
    </tr>
  );
};
