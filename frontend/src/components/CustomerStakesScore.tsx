import { FC, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Tooltip } from './InfoTooltip';
import { Version, CustomerStakes } from '../redux/roadmaps/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { customerStakesSummary } from '../utils/TaskUtils';
import {
  targetCustomerStakes,
  stakesDifferTooMuchFromTarget,
} from '../utils/CustomerUtils';
import { CustomerWeightsTooltipContent } from './CustomerWeightsVisualization';
import { TaskValueCreatedVisualization } from './TaskValueCreatedVisualization';
import { apiV2 } from '../api/api';
import css from './CustomerStakesScore.module.scss';

const classes = classNames.bind(css);

interface TargetStakes {
  id: number;
  target: number;
}

export const CustomerStakesScore: FC<{
  version: Version;
  completed: boolean;
}> = ({ version, completed }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [targetData, setTargetData] = useState<TargetStakes[] | undefined>(
    undefined,
  );
  const [data, setData] = useState<CustomerStakes[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (customers) setTargetData(targetCustomerStakes(customers));
  }, [customers, setTargetData]);

  useEffect(() => {
    if (!targetData) return;

    const customerStakes = Array.from(
      customerStakesSummary(version.tasks, customers),
    );
    const stakesTotalValue = customerStakes.reduce(
      (acc, [, value]) => acc + value.total,
      0,
    );
    setTotalValue(stakesTotalValue);
    setData(
      customerStakes
        .sort(([a], [b]) => b.weight - a.weight)
        .map(([{ id, name, color }, value]) => {
          const target = targetData.find((customer) => customer.id === id)
            ?.target;
          return {
            id,
            name,
            value: value.total,
            color,
            ...(target && {
              differsTooMuchFromPlanned: stakesDifferTooMuchFromTarget(
                value.total / stakesTotalValue,
                target,
              ),
            }),
          };
        }),
    );
  }, [customers, targetData, version.tasks]);

  const scoresDifferFromPlanned = data.some(
    ({ differsTooMuchFromPlanned }) => differsTooMuchFromPlanned,
  );

  if (version.tasks.length === 0)
    return (
      <div className={classes(css.score)}>
        <Trans i18nKey="Client shares" />
        <div className={classes(css.result)}>-</div>
      </div>
    );
  return (
    <Tooltip
      title={
        <TaskValueCreatedVisualization
          stakes={data}
          width={200}
          height={20}
          barWidth={20}
          noTooltip
        />
      }
      placement="right"
      arrow
    >
      <div>
        <div
          className={classes(css.score, {
            [css.completed]: completed,
            [css.differsFromPlanned]: scoresDifferFromPlanned,
          })}
        >
          <Trans i18nKey="Client shares score" />
          <div className={classes(css.result)}>
            <Trans i18nKey={scoresDifferFromPlanned ? 'Poor' : 'Great'} />
          </div>
        </div>
        {scoresDifferFromPlanned && (
          <div className={classes(css.differing)}>
            <CustomerWeightsTooltipContent
              customerStakes={data.filter(
                ({ differsTooMuchFromPlanned }) => differsTooMuchFromPlanned,
              )}
              totalValue={totalValue}
              noTitle
            />
          </div>
        )}
      </div>
    </Tooltip>
  );
};
