import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Version, CustomerStakes } from '../redux/roadmaps/types';
import { totalCustomerStakes } from '../utils/TaskUtils';
import { CustomerStakesVisualization } from './CustomerStakesVisualization';
import css from './TaskValueCreatedVisualization.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

interface VersionComplexityAndTotalValue extends Version {
  complexity: number;
  totalValue: number;
}

const StakesVisualization: FC<{
  customerStakes: CustomerStakes[];
  width: number;
  height: number;
  vertical?: boolean;
}> = ({ customerStakes, width, height, vertical }) => (
  <div className={classes(css.customerStakes)} style={{ width, height }}>
    <CustomerStakesVisualization
      customerStakes={customerStakes}
      totalValue={customerStakes.reduce((acc, { value }) => acc + value, 0)}
      vertical={vertical}
    />
  </div>
);

export const TaskValueCreatedVisualization: FC<{
  version: VersionComplexityAndTotalValue;
  width: number;
  height: number;
}> = ({ version, width, height }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [data, setData] = useState<CustomerStakes[]>([]);

  useEffect(() => {
    const customerStakes = totalCustomerStakes(version.tasks, customers);
    setData(
      Array.from(customerStakes)
        .map(([{ id, name, color }, value]) => ({
          id,
          name,
          value,
          color,
        }))
        .sort((a, b) => b.value - a.value),
    );
  }, [version.tasks, customers]);

  return (
    <StakesVisualization
      customerStakes={data}
      width={width}
      height={height}
      vertical
    />
  );
};
