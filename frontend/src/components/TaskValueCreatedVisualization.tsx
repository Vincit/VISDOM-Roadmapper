import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { allCustomersSelector } from '../redux/roadmaps/selectors';
import { Customer } from '../redux/roadmaps/types';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { RootState } from '../redux/types';
import { Version } from '../redux/versions/types';
import css from './TaskValueCreatedVisualization.module.scss';

export interface TaskValueCreatedVisualizationProps {
  version: Version;
}

export interface DataPoint {
  name: string;
  value: number;
  color: string;
}

export const TaskValueCreatedVisualization: React.FC<TaskValueCreatedVisualizationProps> = ({
  version,
}) => {
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  let totalValue = 0;
  const customerStakes = new Map<Customer, number>();

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
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const data: DataPoint[] = Array.from(customerStakes)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], index) => ({
      name: key.name,
      value,
      color: key.color || COLORS[index % COLORS.length],
    }));

  const valuePercent = (value: number) => {
    const percent = (100 * value) / totalValue;
    return `${percent.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}%`;
  };

  const tooltip = ({
    payload,
    active,
  }: {
    payload: DataPoint[];
    active: boolean;
  }) =>
    active ? (
      <div className="tooltip-base">
        {`${payload[0].name} : ${valuePercent(payload[0].value)}`}
      </div>
    ) : null;

  return (
    <div className={css.container}>
      <h3 className={css.taskTitle}>{version.name}</h3>
      <PieChart width={450} height={200}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={tooltip} allowEscapeViewBox={{ x: true, y: true }} />
        <Legend
          align="right"
          verticalAlign="middle"
          layout="vertical"
          width={200}
        />
      </PieChart>
    </div>
  );
};
