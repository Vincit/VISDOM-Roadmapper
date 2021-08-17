import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Tooltip from '@material-ui/core/Tooltip';
import { Dot } from './Dot';
import { percent } from '../utils/string';
import { CustomerStakes } from '../redux/roadmaps/types';
import css from './CustomerStakesVisualization.module.scss';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

const noRatingsStakes = [
  { id: 1, value: 0.5 },
  { id: 2, value: 0.3 },
  { id: 3, value: 0.1 },
  { id: 4, value: 0.1 },
];

const StakeVisualizationTooltip: FC<{
  title: string;
}> = ({ title, children }) => (
  <Tooltip
    classes={{
      arrow: classes(css.tooltipArrow),
      tooltip: classes(css.tooltip),
    }}
    title={title}
    placement="right"
    arrow
  >
    <div>{children}</div>
  </Tooltip>
);

const StakeVisualizationContent: FC<{
  size: number;
  color: string;
}> = ({ size, color }) => (
  <div
    className={classes(css.dotContainer)}
    style={{
      ['--dot-size' as any]: Math.max(0.2, size),
    }}
  >
    <Dot fill={color} />
  </div>
);

export const CustomerStakesVisualization: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
  largestValue?: number;
}> = ({ customerStakes, totalValue, largestValue }) => {
  const { t } = useTranslation();

  if (!customerStakes.length)
    return (
      <StakeVisualizationTooltip title={`${t('No ratings')}`}>
        <div
          className={classes(css.stakes)}
          style={{
            ['--largest-dot-size' as any]: noRatingsStakes[0].value,
          }}
        >
          {noRatingsStakes.map(({ id, value }) => (
            <StakeVisualizationContent
              key={id}
              size={value}
              color={colors.black10}
            />
          ))}
        </div>
      </StakeVisualizationTooltip>
    );
  return (
    <div
      className={classes(css.stakes)}
      style={{
        ['--largest-dot-size' as any]: largestValue,
        ['--max-diameter-multiplier' as any]: Math.min(
          2,
          Math.max(1, customerStakes.length * 0.3),
        ),
      }}
    >
      {customerStakes.map((entry) => (
        <StakeVisualizationTooltip
          key={entry.id}
          title={`${entry.name} : ${percent(1).format(
            entry.value / totalValue,
          )}`}
        >
          <StakeVisualizationContent
            size={entry.value / totalValue}
            color={entry.color}
          />
        </StakeVisualizationTooltip>
      ))}
    </div>
  );
};
