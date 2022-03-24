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

interface VersionComplexityAndTotalValue extends Version {
  complexity: number;
  totalValue: number;
}

export const TaskValueCreatedVisualization: FC<{
  version: VersionComplexityAndTotalValue;
  width: number;
  height: number;
  noTooltip?: true;
}> = ({ version, width, height, noTooltip }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [data, setData] = useState<CustomerStakes[]>([]);
  const totalValue = data.reduce((acc, { value }) => acc + value, 0);

  useEffect(() => {
    const customerStakes = totalCustomerStakes(version.tasks, customers);
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
  }, [version.tasks, customers]);

  return (
    <div className={classes(css.stakes)}>
      <div style={{ width, height }}>
        <CustomerStakesVisualization
          customerStakes={data}
          totalValue={totalValue}
          noTooltip={noTooltip}
          vertical
        />
      </div>
      {noTooltip && (
        <div className={classes(css.stakesDescription)}>
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
