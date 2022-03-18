import { FC, forwardRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { percent } from '../utils/string';
import { CustomerStakes } from '../redux/roadmaps/types';
import css from './CustomerStakesVisualization.module.scss';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

const BAR_WIDTH = 37;

const BarSection: FC<{
  size: number;
  color: string;
  vertical?: boolean;
}> = ({ size, color, vertical, children }) => (
  <div
    style={{
      zIndex: 10,
      backgroundColor: color,
      userSelect: 'none',
      height: vertical ? `${100 * size}%` : BAR_WIDTH,
      width: vertical ? BAR_WIDTH : `${100 * size}%`,
    }}
  >
    {children}
  </div>
);

const PercentageBar: FC<{
  stakes: { value: number; id: number | string; color: string }[];
  totalValue: number;
  vertical?: boolean;
}> = forwardRef(
  ({ stakes, totalValue, vertical, children, ...props }, ref: any) => (
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
            />
          ))
      ) : (
        <BarSection size={1} color={colors.black10} vertical={vertical} />
      )}
    </div>
  ),
);

// TODO: implement new design
const StakesTooltip: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
}> = ({ customerStakes, totalValue }) => {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {customerStakes.length
        ? customerStakes.map((entry) => (
            <div key={entry.id}>
              {entry.name}:{' '}
              {percent(1).format(totalValue > 0 ? entry.value / totalValue : 0)}
            </div>
          ))
        : t('No ratings')}
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
