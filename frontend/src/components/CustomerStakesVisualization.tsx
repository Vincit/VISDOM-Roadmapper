import { FC } from 'react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { Dot } from './Dot';
import { percent } from '../utils/string';
import { CustomerStakes } from '../redux/roadmaps/types';
import css from './CustomerStakesVisualization.module.scss';

const classes = classNames.bind(css);

export const CustomerStakesVisualization: FC<{
  customerStakes: CustomerStakes[];
  totalValue: number;
  largestValue: number;
}> = ({ customerStakes, totalValue, largestValue }) => {
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
        <Tooltip
          key={entry.id}
          classes={{
            arrow: classes(css.tooltipArrow),
            tooltip: classes(css.tooltip),
          }}
          title={`${entry.name} : ${percent(1).format(
            entry.value / totalValue,
          )}`}
          placement="right"
          arrow
        >
          <div
            className={classes(css.dotContainer)}
            style={{
              ['--dot-size' as any]: Math.max(0.2, entry.value / totalValue),
            }}
          >
            <Dot fill={entry.color} />
          </div>
        </Tooltip>
      ))}
    </div>
  );
};
