import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Version, CustomerStakes } from '../redux/roadmaps/types';
import { totalCustomerStakes } from '../utils/TaskUtils';
import {
  CustomerStakesVisualization,
  StakesTooltipContent,
} from './CustomerStakesVisualization';
import css from './TaskValueCreatedVisualization.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const TaskValueCreatedVisualization: FC<{
  versions: Version[];
  width: number;
  height: number;
  barWidth?: number;
  noTooltip?: true;
  vertical?: boolean;
}> = ({ versions, width, height, noTooltip, vertical, barWidth = 37 }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );

  const [data, setData] = useState<CustomerStakes[]>([]);
  const totalValue = data.reduce((acc, { value }) => acc + value, 0);

  useEffect(() => {
    const allTasks = versions.flatMap((version) => version.tasks);
    const customerStakes = totalCustomerStakes(allTasks, customers);
    setData(
      Array.from(customerStakes)
        .sort(([a], [b]) => b.weight - a.weight)
        .map(([{ id, name, color }, value]) => ({
          id,
          name,
          value,
          color,
        })),
    );
  }, [versions, customers]);

  return (
    <div className={classes(css.stakes)}>
      <div style={{ width, height }}>
        <CustomerStakesVisualization
          customerStakes={data}
          totalValue={totalValue}
          noTooltip={noTooltip}
          vertical={vertical}
          barWidth={barWidth}
        />
      </div>
      {noTooltip && (
        <div>
          <StakesTooltipContent
            customerStakes={data}
            totalValue={totalValue}
            noTitle
          />
        </div>
      )}
    </div>
  );
};
