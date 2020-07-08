import React from 'react';
import styled from 'styled-components';
import { ReactComponent as RatingsIcon } from '../../icons/ratings_icon.svg';

const StyledRatingsIcon = styled(RatingsIcon)`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

export const RatingsButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}> = ({ onClick }) => {
  return <StyledRatingsIcon onClick={onClick} />;
};
