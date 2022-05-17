import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Version, CustomerStakes } from '../redux/roadmaps/types';
import { customerStakesSummary } from '../utils/TaskUtils';
import {
  CustomerStakesVisualization,
  StakesTooltipContent,
} from './CustomerStakesVisualization';
import css from './TaskValueCreatedVisualization.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

// either provide versions or customer stakes
export const TaskValueCreatedVisualization: FC<
  ({ stakes: CustomerStakes[] } | { versions: Version[] }) & {
    width: number;
    height: number;
    barWidth?: number;
    noTooltip?: true;
    vertical?: boolean;
  }
> = ({ width, height, noTooltip, vertical, barWidth = 37, ...props }) => {
  const { stakes, versions } = {
    stakes: undefined,
    versions: undefined,
    ...props,
  };
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
    { skip: stakes !== undefined },
  );

  const [data, setData] = useState<CustomerStakes[]>([]);
  const totalValue = (stakes || data).reduce(
    (acc, { value }) => acc + value,
    0,
  );

  useEffect(() => {
    if (!versions) return;
    const allTasks = versions.flatMap((version) => version.tasks);
    const customerStakes = customerStakesSummary(allTasks, customers);
    setData(
      Array.from(customerStakes)
        .sort(([a], [b]) => b.weight - a.weight)
        .map(([{ id, name, color }, value]) => ({
          id,
          name,
          value: value.total,
          color,
        })),
    );
  }, [versions, customers]);

  return (
    <div
      className={classes(css.stakes, {
        [css.vertical]: vertical,
      })}
    >
      <div style={{ width, height }}>
        <CustomerStakesVisualization
          customerStakes={stakes || data}
          totalValue={totalValue}
          noTooltip={noTooltip}
          vertical={vertical}
          barWidth={barWidth}
        />
      </div>
      {noTooltip && (
        <div>
          <StakesTooltipContent
            customerStakes={stakes || data}
            totalValue={totalValue}
            noTitle
          />
        </div>
      )}
    </div>
  );
};
