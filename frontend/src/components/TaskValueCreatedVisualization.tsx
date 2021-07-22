import { FC, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, Version } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { Dot } from './Dot';
import { totalCustomerStakes } from '../utils/TaskUtils';
import { percent } from '../utils/string';
import css from './TaskValueCreatedVisualization.module.scss';

const classes = classNames.bind(css);

export interface DataPoint {
  id: number;
  name: string;
  value: number;
  color: string;
}

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
  const [data, setData] = useState<DataPoint[]>([]);
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

  const largestValue = (stakes: DataPoint[]) => {
    if (!stakes.length) return 0;
    return stakes[0].value / version.totalValue;
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
              entry.value / version.totalValue,
            )}`}
            placement="right"
            arrow
          >
            <div
              className={classes(css.dotContainer)}
              style={{
                ['--dot-size' as any]: Math.max(
                  0.2,
                  entry.value / version.totalValue,
                ),
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
