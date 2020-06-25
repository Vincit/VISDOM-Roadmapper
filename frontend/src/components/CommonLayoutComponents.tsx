import { Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';

export const FullHeightContainer = styled(Container)`
  min-height: 100%;
  height: 100%;
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
