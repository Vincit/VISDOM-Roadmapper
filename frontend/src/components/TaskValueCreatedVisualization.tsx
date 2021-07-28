import { FC } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { allCustomersSelector } from '../redux/roadmaps/selectors';
import { Customer, Version } from '../redux/roadmaps/types';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { RootState } from '../redux/types';
import { Dot } from './Dot';
import { totalValueAndWork } from '../utils/TaskUtils';
import { percent } from '../utils/string';
import css from './TaskValueCreatedVisualization.module.scss';

const classes = classNames.bind(css);

export interface DataPoint {
  id: number;
  name: string;
  value: number;
  color: string;
}

export const TaskValueCreatedVisualization: FC<{
  version: Version;
}> = ({ version }) => {
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  let totalValue = 0;
  const customerStakes = new Map<Customer, number>();
  const { work } = totalValueAndWork(version.tasks);
  const w = Math.max(100, 60 * (work / 5));

  // Calculate total sum of task values in the milestone
  // And map values of how much each user has rated in these tasks
  version.tasks.forEach((task) => {
    if (task == null) return;

    task.ratings.forEach((rating) => {
      if (rating.dimension !== TaskRatingDimension.BusinessValue) return;
      const customer = customers?.find(({ id }) => id === rating.forCustomer);
      if (customer) {
        totalValue += rating.value;
        const previousVal = customerStakes.get(customer) || 0;
        customerStakes.set(customer, previousVal + rating.value);
      }
    });
  });

  // Format for recharts
  const data: DataPoint[] = Array.from(customerStakes)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      id: key.id,
      name: key.name,
      value,
      color: key.color,
    }));

  const largestValue = (stakes: DataPoint[]) => {
    if (!stakes.length) return 0;
    return stakes[0].value / totalValue;
  };

  return (
    <div
      className={classes(css.stakes)}
      style={{
        ['--version-width' as any]: `${w}px`,
        ['--largest-dot-size' as any]: largestValue(data),
        ['--max-diameter-multiplier' as any]: Math.min(
          2,
          Math.max(1, data.length * 0.3),
        ),
      }}
    >
      {data.map((entry) => (
        <div key={entry.id}>
          <Tooltip
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
        </div>
      ))}
    </div>
  );
};
