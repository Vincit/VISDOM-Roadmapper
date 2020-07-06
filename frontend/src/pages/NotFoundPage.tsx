import React from 'react';
import { Col } from 'react-bootstrap';
import { QuestionDiamondFill } from 'react-bootstrap-icons';
import styled from 'styled-components';

const TextDiv = styled.div`
  padding: 8px;
  margin: auto;
  margin-top: 32px;
  font-weight: bold;
  font-size: 26px;
`;

export const NotFoundPage = () => {
  return (
    <Col>
      <TextDiv>
        <QuestionDiamondFill />
        <p>Page not found.</p>
      </TextDiv>
    </Col>
  );
};
