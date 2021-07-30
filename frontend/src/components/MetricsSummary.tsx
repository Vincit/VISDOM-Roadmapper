import { FC } from 'react';
import classNames from 'classnames';
import css from './MetricsSummary.module.scss';

const classes = classNames.bind(css);

export const MetricsSummary: FC<{
  label: string;
  value: string | number;
  children?: any;
}> = ({ label, value, children }) => (
  <div className={classes(css.dataEntryWrapper)}>
    {label}
    <div className={classes(css.dash)} />
    <div className={classes(css.dataNumberWrapper)}>
      {value}
      <div>{children}</div>
    </div>
  </div>
);
