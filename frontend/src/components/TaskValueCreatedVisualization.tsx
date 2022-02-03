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

export const TaskValueCreatedVisualization: FC<{
  version: VersionComplexityAndTotalValue;
  width: number;
}> = ({ version, width }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [data, setData] = useState<CustomerStakes[]>([]);

  useEffect(() => {
    if (!roadmapId) return;

    const customerStakes = totalCustomerStakes(version.tasks, customers);
    setData(
      Array.from(customerStakes)
        .filter((a) => a[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([{ id, name, color }, value]) => ({
          id,
          name,
          value,
          color,
        })),
    );
  }, [roadmapId, version.tasks, customers]);

  const largestValue = (stakes: CustomerStakes[]) => {
    if (!stakes.length) return undefined;
    return stakes[0].value / version.totalValue;
  };

  return (
    <div
      className={classes(css.customerStakes)}
      style={{
        ['--version-width' as any]: `${width}px`,
        ['--largest-dot-size' as any]: largestValue(data),
        ['--max-diameter-multiplier' as any]: Math.min(
          2,
          Math.max(1, data.length * 0.3),
        ),
      }}
    >
      <CustomerStakesVisualization
        customerStakes={data}
        totalValue={version.totalValue}
        largestValue={largestValue(data)}
      />
    </div>
  );
};
