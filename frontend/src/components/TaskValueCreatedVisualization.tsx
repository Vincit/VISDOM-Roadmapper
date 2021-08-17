import { FC, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Version, CustomerStakes } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { totalCustomerStakes } from '../utils/TaskUtils';
import { CustomerStakesVisualization } from './CustomerStakesVisualization';
import css from './TaskValueCreatedVisualization.module.scss';

const classes = classNames.bind(css);

interface VersionWorkAndTotalValue extends Version {
  work: number;
  totalValue: number;
}

export const TaskValueCreatedVisualization: FC<{
  version: VersionWorkAndTotalValue;
}> = ({ version }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const [data, setData] = useState<CustomerStakes[]>([]);
  const w = Math.max(100, 60 * (version.work / 5));

  useEffect(() => {
    if (!currentRoadmap) {
      dispatch(roadmapsActions.getRoadmaps());
      return;
    }

    const customerStakes = totalCustomerStakes(version.tasks, currentRoadmap);
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
  }, [dispatch, currentRoadmap, version.tasks]);

  const largestValue = (stakes: CustomerStakes[]) => {
    if (!stakes.length) return undefined;
    return stakes[0].value / version.totalValue;
  };

  return (
    <div
      className={classes(css.customerStakes)}
      style={{
        ['--version-width' as any]: `${w}px`,
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
