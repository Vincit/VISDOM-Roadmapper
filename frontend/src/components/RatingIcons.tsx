import { StarFill, Wrench } from 'react-bootstrap-icons';
import styled from 'styled-components';

export const BusinessValueEmpty = styled(StarFill)`
  color: gray;
  opacity: 0.25;
  width: 1.5em;
  height: 1.5em;
  margin: 0.1em;
`;

export const BusinessValueFilled = styled(StarFill)`
  color: gold;
  width: 1.5em;
  height: 1.5em;
  margin: 0.1em;
`;

export const RequiredWorkEmpty = styled(Wrench)`
  color: gray;
  opacity: 0.25;
  width: 1.5em;
  height: 1.5em;
  margin: 0.1em;
`;

export const RequiredWorkFilled = styled(Wrench)`
  color: black;
  width: 1.5em;
  height: 1.5em;
  margin: 0.1em;
`;
