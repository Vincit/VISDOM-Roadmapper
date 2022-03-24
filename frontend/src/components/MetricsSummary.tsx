import { FC } from 'react';
import classNames from 'classnames';
import css from './MetricsSummary.module.scss';

const classes = classNames.bind(css);

export interface MetricsProps {
  label: string;
  value?: string | number;
  children?: any;
}

export const MetricsSummary: FC<MetricsProps> = ({
  label,
  value,
  children,
}) => (
  <div className={classes(css.dataEntryWrapper)}>
    {label}
    {value !== undefined && (
      <>
        <div className={classes(css.dash)} />
        <div className={classes(css.dataNumberWrapper)}>
          {value}
          <div>{children}</div>
        </div>
      </>
    )}
  </div>
);
