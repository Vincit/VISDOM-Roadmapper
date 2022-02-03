import { FC, useState } from 'react';
import { LockFill, UnlockFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import classNames from 'classnames';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Task } from '../redux/roadmaps/types';
import {
  weightedTaskPriority,
  valueAndComplexitySummary,
  hasRatingsOnEachDimension,
} from '../utils/TaskUtils';
import { sort, SortingOrders, sortKeyNumeric } from '../utils/SortUtils';
import css from './PlannerChart.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

const colors = ['blue', 'red', 'green', 'yellow', 'orange'];

enum DataKeys {
  OptimalRoadmap = 'Optimal roadmap',
  SavedData = 'Saved graph',
}

type DataPoint = {
  complexitySum: number;
  valueSum: number;
  [name: string]: number | undefined;
};

export const PlannerChart: FC<{
  versions: { name: string; tasks: Task[] }[];
  hideButtons?: boolean;
}> = ({ versions, hideButtons }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const { data: roadmapTasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const [savedData, setSavedData] = useState<DataPoint[] | undefined>(
    undefined,
  );

  const graphTaskLists = [...versions];
  const versionKeyNames = graphTaskLists.map((ver) => ver.name);
  if (!savedData) {
    // Add current roadmaps all tasks to the versions list that will be charted

    graphTaskLists.unshift({
      name: DataKeys.OptimalRoadmap,
      tasks: sort(
        sortKeyNumeric(weightedTaskPriority(customers)),
        SortingOrders.DESCENDING,
      )(roadmapTasks?.filter(hasRatingsOnEachDimension) ?? []),
    });
  }
  const versionDataPoints = () => {
    let complexitySum = 0;
    let valueSum = 0;
    let previousLineEnd = {
      complexitySum: 0,
      valueSum: 0,
    };
    return graphTaskLists.reduce<DataPoint[]>((acc, version) => {
      const { name } = version;
      const tasks = [...version.tasks];

      const more = [
        Object.assign(previousLineEnd, { [name]: previousLineEnd.valueSum }),
        ...tasks.map((task) => {
          const { value, complexity } = valueAndComplexitySummary(task);
          complexitySum += complexity.avg;
          valueSum += value.total;

          return {
            [name]: valueSum,
            complexitySum,
            valueSum,
          };
        }),
      ];

      // Resetting sums when the first ("optimal roadmap") chart has been drawn
      if (version.name === DataKeys.OptimalRoadmap) {
        complexitySum = 0;
        valueSum = 0;
      }
      // Version charts are supposed to be in a series so that next versions chart starts from where the previous ended
      // Save last point of chart so next chart can begin there
      previousLineEnd = {
        complexitySum,
        valueSum,
      };
      return [...acc, ...more];
    }, []);
  };

  const dataPoints = [...versionDataPoints(), ...(savedData || [])];

  const toggleSavedData = () => {
    if (savedData !== undefined) {
      setSavedData(undefined);
      return;
    }

    const savedDataPts = dataPoints
      .filter(
        (data) =>
          !(DataKeys.OptimalRoadmap in data) && !(DataKeys.SavedData in data),
      )
      .map((data) => ({
        complexitySum: data.complexitySum,
        valueSum: data.valueSum,
        [DataKeys.SavedData]: data.valueSum,
      }));
    setSavedData(savedDataPts);
  };

  // Calculating X and Y axis min and max values and tick count
  const complexitySumMax = dataPoints.reduce(
    (prevMax, dataPt) => Math.max(prevMax, dataPt.complexitySum),
    0,
  );
  const valueSumMax = dataPoints.reduce(
    (prevMax, dataPt) => Math.max(prevMax, dataPt.valueSum),
    0,
  );
  const complexityDomainMax = Math.max(Math.ceil(complexitySumMax / 5) * 5, 10);
  const valueDomainMax = Math.max(Math.ceil(valueSumMax / 5) * 5, 10);
  const complexityAxisTicks = complexityDomainMax / 5 + 1;
  const valueAxisTicks = valueDomainMax / 5 + 1;

  return (
    <div className={classes(css.graphWrapper)}>
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart
          data={dataPoints}
          margin={{ top: 32, right: 64, left: 0, bottom: 32 }}
        >
          {savedData ? (
            <Line
              isAnimationActive={false}
              key={DataKeys.SavedData}
              id={DataKeys.SavedData}
              name={DataKeys.SavedData}
              type="linear"
              dataKey={DataKeys.SavedData}
              stroke="black"
            />
          ) : (
            <Line
              isAnimationActive={false}
              key={DataKeys.OptimalRoadmap}
              id={DataKeys.OptimalRoadmap}
              name={DataKeys.OptimalRoadmap}
              type="linear"
              dataKey={DataKeys.OptimalRoadmap}
              stroke="black"
            />
          )}
          {versionKeyNames.map((vername, index) => (
            <Line
              isAnimationActive={false}
              id={vername}
              key={vername}
              name={vername}
              type="linear"
              dataKey={vername}
              stroke={colors[index]}
            />
          ))}

          <XAxis
            tickCount={complexityAxisTicks}
            type="number"
            dataKey="complexitySum"
            domain={[0, complexityDomainMax]}
          >
            <Label
              position="insideLeft"
              dx={-4}
              dy={20}
              className={classes(css.label)}
            >
              Complexity
            </Label>
          </XAxis>
          <CartesianGrid vertical={false} />

          <YAxis
            type="number"
            tickCount={valueAxisTicks}
            domain={[0, valueDomainMax]}
          >
            <Label
              position="insideBottom"
              angle={90}
              dx={-10}
              dy={-14}
              className={classes(css.label)}
            >
              Value
            </Label>
          </YAxis>
          <Legend verticalAlign="bottom" />
        </LineChart>
      </ResponsiveContainer>
      {!hideButtons && (
        <div className={classes(css.buttonsBar)}>
          <button
            className={classes(css['button-large'])}
            type="submit"
            onClick={toggleSavedData}
          >
            <div className={classes(css.lockIcon)}>
              {savedData ? <LockFill /> : <UnlockFill />}
            </div>
            Compare these versions
          </button>
        </div>
      )}
    </div>
  );
};
