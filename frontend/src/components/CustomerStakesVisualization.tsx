import { FC, forwardRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { Dot } from './Dot';
import { percent } from '../utils/string';
import { CustomerStakes } from '../redux/roadmaps/types';
import css from './CustomerStakesVisualization.module.scss';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

const BarSection: FC<{
  size: number;
  color: string;
  vertical?: boolean;
  width?: number;
}> = ({ size, color, vertical, width = 37, children }) => (
  <div
    style={{
      zIndex: 10,
      backgroundColor: color,
      userSelect: 'none',
      height: vertical ? `${100 * size}%` : width,
      width: vertical ? width : `${100 * size}%`,
    }}
  >
    {children}
  </div>
);

const PercentageBar: FC<{
  stakes: { value: number; id: number | string; color: string }[];
  totalValue: number;
  vertical?: boolean;
  width?: number;
}> = forwardRef(
  ({ stakes, totalValue, vertical, width, children, ...props }, ref: any) => (
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
              width={width}
            />
          ))
      ) : (
        <BarSection
          size={1}
          color={colors.black10}
          vertical={vertical}
          width={width}
        />
      )}
    </div>
  ),
);

const StakesTooltip: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
  showPercentageBar?: boolean;
}> = ({ customerStakes, totalValue, showPercentageBar }) => {
  const { t } = useTranslation();

  if (customerStakes.length === 0)
    return <div className={classes(css.stakesTooltip)}>{t('No ratings')}</div>;

  return (
    <div className={classes(css.stakesTooltip)}>
      <div>{t('Client shares')}</div>
      {showPercentageBar && (
        <PercentageBar
          stakes={customerStakes}
          totalValue={totalValue}
          width={15}
        />
      )}
      {customerStakes.map((entry) => (
        <div
          key={entry.id}
          className={classes(css.customer, {
            [css.differsTooMuch]: entry.differsTooMuchFromPlanned,
          })}
        >
          <Dot fill={entry.color} />
          <span className={classes(css.name)}>{entry.name}</span>
          <span className={classes(css.percentage)}>
            {percent(1).format(totalValue > 0 ? entry.value / totalValue : 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const CustomerStakesVisualization: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
  vertical?: boolean;
}> = ({ customerStakes, totalValue, vertical }) => (
  <Tooltip
    classes={{
      arrow: classes(css.tooltipArrow),
      tooltip: classes(css.tooltip),
    }}
    title={
      <StakesTooltip customerStakes={customerStakes} totalValue={totalValue} />
    }
    placement="right"
    arrow
  >
    <PercentageBar
      stakes={customerStakes}
      totalValue={totalValue}
      vertical={vertical}
    />
  </Tooltip>
);
