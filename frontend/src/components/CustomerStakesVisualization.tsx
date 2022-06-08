import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './InfoTooltip';
import { Dot } from './Dot';
import { percent } from '../utils/string';
import { CustomerStakes } from '../redux/roadmaps/types';
import css from './CustomerStakesVisualization.module.scss';
import { PercentageBar } from './PercentageBar';

const classes = classNames.bind(css);

export const StakesTooltipContent: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
  showPercentageBar?: boolean;
  noTitle?: true;
}> = ({ customerStakes, totalValue, showPercentageBar, noTitle }) => {
  const { t } = useTranslation();

  if (customerStakes.length === 0)
    return <div className={classes(css.stakesTooltip)}>{t('No ratings')}</div>;

  return (
    <div className={classes(css.stakesTooltip)}>
      {!noTitle && <div>{t('Client shares')}</div>}
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
  noTooltip?: true;
  barWidth: number;
}> = ({ customerStakes, totalValue, vertical, noTooltip, barWidth }) => {
  if (noTooltip)
    return (
      <PercentageBar
        stakes={customerStakes}
        totalValue={totalValue}
        vertical={vertical}
        width={barWidth}
      />
    );
  return (
    <Tooltip
      title={
        <StakesTooltipContent
          customerStakes={customerStakes}
          totalValue={totalValue}
        />
      }
      placement="right"
      arrow
    >
      <PercentageBar
        stakes={customerStakes}
        totalValue={totalValue}
        vertical={vertical}
        width={barWidth}
      />
    </Tooltip>
  );
};
