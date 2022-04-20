import { FC, forwardRef } from 'react';
import classNames from 'classnames';
import colors from '../colors.module.scss';
import css from './PercentageBar.module.scss';

const classes = classNames.bind(css);

const BarSection: FC<{
  size: number;
  color: string;
  vertical?: boolean;
  barThicknessPx: number;
}> = ({ size, color, vertical, barThicknessPx, children }) => (
  <div
    className={classes(css.barSection, {
      [css.vertical]: vertical,
    })}
    style={{
      ['--size' as any]: size,
      ['--color' as any]: color,
      ['--barThickness' as any]: `${barThicknessPx}px`,
    }}
  >
    {children}
  </div>
);

export const PercentageBar: FC<{
  stakes: { value: number; id: number | string; color: string }[];
  totalValue: number;
  vertical?: boolean;
  width: number;
}> = forwardRef(
  ({ stakes, totalValue, vertical, width, ...props }, ref: any) => (
    <div
      {...{ ...props, ref /* for mui tooltip */ }}
      className={classes(css.stakes, {
        [css.vertical]: vertical,
      })}
    >
      {totalValue > 0 ? (
        stakes
          .filter(({ value }) => value > 0)
          .map((entry) => (
            <BarSection
              key={entry.id}
              size={entry.value / totalValue}
              color={entry.color}
              vertical={vertical}
              barThicknessPx={width}
            />
          ))
      ) : (
        <BarSection
          size={1}
          color={colors.black10}
          vertical={vertical}
          barThicknessPx={width}
        />
      )}
    </div>
  ),
);
