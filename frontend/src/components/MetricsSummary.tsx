import React from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import css from './MetricsSummary.module.scss';

const classes = classNames.bind(css);

export const MetricsSummary: React.FC<{
  label: string;
  value: string | number;
  children?: any;
}> = ({ label, value, children }) => (
  <div className={classes(css.dataEntryWrapper)}>
    <Trans i18nKey={label} />
    <div className={classes(css.dash)} />
    <div className={classes(css.dataNumberWrapper)}>
      {value}
      <div>{children}</div>
    </div>
  </div>
);
