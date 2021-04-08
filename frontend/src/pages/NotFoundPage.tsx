import React from 'react';
import { Col } from 'react-bootstrap';
import NotListedLocationIcon from '@material-ui/icons/NotListedLocation';
import classNames from 'classnames';
import css from './NotFoundPage.module.scss';

const classes = classNames.bind(css);

export const NotFoundPage = () => {
  return (
    <Col>
      <div className={classes(css.textDiv)}>
        <NotListedLocationIcon fontSize="large" />
        <p>Page not found.</p>
      </div>
    </Col>
  );
};
