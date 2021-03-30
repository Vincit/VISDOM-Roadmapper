import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import styled from 'styled-components';
import {
  chosenRoadmapSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import {
  PublicUser,
  Roadmap,
  TaskRatingDimension,
} from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { Version } from '../redux/versions/types';
import { calcTaskValueSum } from '../utils/TaskUtils';

export interface TaskValueCreatedVisualizationProps {
  version: Version;
}

export interface DataPoint {
  name: string;
  value: number;
  color: string;
}

// TODO: split up the pre-title style etc. when moving to scss
const Container = styled.div`
  .tooltip-base {
    align-items: center;
    padding: 10px 17px;

    background: white;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.2);
    border-radius: 19px;

    /* Pre title */
    font-family: Anonymous Pro;
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 100%;
    /* identical to box height, or 12px */
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: 0.2em;
    text-transform: uppercase;

    /* Black / 100 */
    color: #000000;

    /* Inside Auto Layout */
    margin: 0px 10px;
  }
`;

const Title = styled.p`
  width: 400px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0;
`;

export const TaskValueCreatedVisualization: React.FC<TaskValueCreatedVisualizationProps> = ({
  version,
}) => {
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
    shallowEqual,
  );
  let totalValue = 0;
  const customerStakes = new Map<PublicUser, number>();
  const versionTasks = version.tasks.map((taskId) =>
    roadmap?.tasks.find((task) => task.id === taskId),
  );

  // Calculate total sum of task values in the milestone
  // And map values of how much each user has rated in these tasks
  versionTasks.forEach((task) => {
    totalValue += calcTaskValueSum(task!) || 0;
    task?.ratings.forEach((rating) => {
      if (rating.dimension !== TaskRatingDimension.BusinessValue) return;
      const user = publicUsers?.find((u) => u.id === rating.createdByUser);
      if (user) {
        const previousVal = customerStakes.get(user) || 0;
        customerStakes.set(user, previousVal + rating.value);
      }
    });
  });

  // Format for recharts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const data: DataPoint[] = Array.from(customerStakes)
    .sort((a, b) => b[1] - a[1])
    .map(([key, val], index) => ({
      name: key.username,
      value: Math.round(val * 100) / 100,
      color: COLORS[index % COLORS.length],
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
    <Container>
      <Title>{version.name}</Title>
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
    </Container>
  );
};
