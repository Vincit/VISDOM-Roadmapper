import { FC } from 'react';
import classNames from 'classnames';
import css from './MetricsSummary.module.scss';

const classes = classNames.bind(css);

const numFormat = (number: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: number < 10 ? 1 : 0,
  }).format(number);

export interface MetricsProps {
  label: string;
  value?: number | null;
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
          {value !== null && numFormat(value)}
          <div>{children}</div>
        </div>
      </>
    )}
  </div>
);
