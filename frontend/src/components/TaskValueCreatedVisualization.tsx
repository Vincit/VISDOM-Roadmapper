import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
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
import { calcTaskAverageRating, calcTaskValueSum } from '../utils/TaskUtils';
import { useMousePosition } from '../utils/useMousePosition';

export interface TaskValueCreatedVisualizationProps {
  version: Version;
}

export interface DataPoint {
  name: string;
  value: number;
  color: string;
}

const Container = styled.div``;

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
  const data: DataPoint[] = [];
  let index = 0;
  customerStakes.forEach((val, key) => {
    data.push({
      name: key.username,
      value: Math.round(val * 100) / 100,
      color: COLORS[index % COLORS.length],
    });
    index += 1;
  });

  return (
    <Container>
      <Title>{version.name}</Title>
      <PieChart width={400} height={200}>
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
        <Tooltip allowEscapeViewBox={{ x: true, y: true }} />
        <Legend align="right" verticalAlign="middle" layout="vertical" />
      </PieChart>
    </Container>
  );
};
