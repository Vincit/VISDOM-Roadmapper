import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { CustomerStakes } from '../redux/roadmaps/types';
import css from './CustomerWeightsVisualization.module.scss';
import { apiV2 } from '../api/api';
import { Dot } from './Dot';
import { percent } from '../utils/string';
import { PercentageBar } from './PercentageBar';

const classes = classNames.bind(css);

export const CustomerWeightsTooltipContent: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
  showPercentageBar?: boolean;
  noTitle?: true;
}> = ({ customerStakes, totalValue, showPercentageBar, noTitle }) => {
  const { t } = useTranslation();

  if (customerStakes.length === 0)
    return (
      <div className={classes(css.stakesTooltip)}>
        {t('No client weights set')}
      </div>
    );

  return (
    <div className={classes(css.stakesTooltip)}>
      {!noTitle && <div>{t('Client weights')}</div>}
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

const CustomerWeightsPercentageBar: FC<{
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
      classes={{
        arrow: classes(css.tooltipArrow),
        tooltip: classes(css.tooltip),
      }}
      title={
        <CustomerWeightsTooltipContent
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

export const CustomerWeightsVisualization: FC<{
  width: number;
  height: number;
  barWidth?: number;
  noTooltip?: true;
  vertical?: boolean;
  light?: true;
}> = ({ width, height, noTooltip, vertical, light, barWidth = 37 }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [data, setData] = useState<CustomerStakes[]>([]);
  const totalValue = data.reduce((acc, { value }) => acc + value, 0);

  useEffect(() => {
    if (!customers) return;

    setData(
      [...customers]
        .sort((a, b) => b.weight - a.weight)
        .map(({ id, name, color, weight }) => ({
          id,
          name,
          value: weight,
          color,
        })),
    );
  }, [customers, setData]);

  return (
    <div className={classes(css.stakes, { [css.light]: light })}>
      <div style={{ width, height }}>
        <CustomerWeightsPercentageBar
          customerStakes={data}
          totalValue={totalValue}
          noTooltip={noTooltip}
          vertical={vertical}
          barWidth={barWidth}
        />
      </div>
      {noTooltip && (
        <div className={classes(css.stakesDescription)}>
          <CustomerWeightsTooltipContent
            customerStakes={data}
            totalValue={totalValue}
            noTitle
          />
        </div>
      )}
    </div>
  );
};
