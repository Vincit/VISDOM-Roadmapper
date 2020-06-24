import React from 'react';
import { Navbar, Form, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { InfoCircle } from 'react-bootstrap-icons';
import {
  FullHeightRow,
  FullHeightContainer,
} from '../components/CommonLayoutComponents';

const Styles = styled.div`
  min-height: 100%;
  height: 100%;

  .bottomborder {
    border: 0px;
    border-bottom: 1px solid black;
  }
  .rightborder {
    border: 0px;
    border-right: 1px solid black;
  }
`;

const Divider = styled.hr`
  border: 0px;
  border-top: 1px solid black;
`;

const ColumnHeader = styled.div`
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 10%;
  text-align: start;
`;

const LabeledDiv = styled.div`
  text-align: start;
`;

const ColumnContent = styled.div`
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 5%;
`;

export const RatingPage = () => {
  const renderTopbar = () => {
    return (
      <Navbar className="justify-content-start bottomborder">
        <Form className="w-100">
          <Form.Row className="align-items-center">
            <Col className="d-flex justify-content-start align-items-center">
              <InfoCircle className="m-1" />
              <Trans i18nKey="How to rate?" />
            </Col>
            <Col className="d-flex justify-content-end">
              <Trans i18nKey="Sort by" />
            </Col>
          </Form.Row>
        </Form>
      </Navbar>
    );
  };

  const renderLeftColumn = () => {
    return (
      <Col className="rightborder">
        <ColumnHeader>
          <Trans i18nKey="Your ratings" />
          <Divider />
        </ColumnHeader>
        <ColumnContent>
          <LabeledDiv>
            <Trans i18nKey="Not yet rated:" />
          </LabeledDiv>
        </ColumnContent>
      </Col>
    );
  };

  const renderRightColumn = () => {
    return (
      <Col>
        <ColumnHeader>
          <Trans i18nKey="Team's overall ratings" />
          <Divider />
        </ColumnHeader>
      </Col>
    );
  };

  const renderContent = () => {
    return (
      <FullHeightContainer fluid>
        <FullHeightRow>
          {renderLeftColumn()} {renderRightColumn()}
        </FullHeightRow>
      </FullHeightContainer>
    );
  };

  return (
    <Styles>
      {renderTopbar()}
      {renderContent()}
    </Styles>
  );
};
