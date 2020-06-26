import { Col, Container, Navbar, Row } from 'react-bootstrap';
import styled from 'styled-components';

export const PaddingLessContainer = styled(Container)`
  padding: 0;
  margin: 0;
`;

export const FullHeightRow = styled(Row)`
  min-height: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
`;

export const PaddinglessCol = styled(Col)`
  padding: 0;
  margin: 0;
`;

export const PaddinglessRow = styled(Row)`
  padding: 0;
  margin: 0;
`;

export const Divider = styled.hr`
  border: 0px;
  border-top: 1px solid black;
`;

export const ColumnHeader = styled.div`
  margin-top: 0.5em;
  text-align: start;
  user-select: none;
`;

export const TopBarWithBorder = styled(Navbar)`
  border: 0px;
  border-bottom: 1px solid black;
  width: 100%;
`;
