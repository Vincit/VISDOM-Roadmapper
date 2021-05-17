import React, { useState } from 'react';
import { LockFill, UnlockFill } from 'react-bootstrap-icons';
import { shallowEqual, useSelector } from 'react-redux';
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
import {
  chosenRoadmapSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import {
  Customer,
  Roadmap,
  Task,
  TaskRatingDimension,
} from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  calcTaskAverageRating,
  calcTaskValueSum,
  calcWeightedTaskPriority,
} from '../utils/TaskUtils';
import css from './PlannerChart.module.scss';

const classes = classNames.bind(css);

const colors = ['blue', 'red', 'green', 'yellow', 'orange'];

enum DataKeys {
  OptimalRoadmap = 'Optimal roadmap',
  SavedData = 'Saved graph',
}

export const PlannerChart: React.FC<{
  versions: { name: string; tasks: Task[] }[];
  hideButtons?: boolean;
}> = ({ versions, hideButtons }) => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  )!;
  const [savedData, setSavedData] = useState<any[] | undefined>(undefined);

  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );

  const graphTaskLists = [...versions];
  const versionKeyNames = graphTaskLists.map((ver) => ver.name);
  if (!savedData) {
    // Add current roadmaps all tasks to the versions list that will be charted

    graphTaskLists.unshift({
      name: DataKeys.OptimalRoadmap,
      tasks: [...currentRoadmap.tasks].sort(
        (a, b) =>
          calcWeightedTaskPriority(b, customers!, currentRoadmap) -
          calcWeightedTaskPriority(a, customers!, currentRoadmap),
      ),
    });
  }
  const versionDataPoints = () => {
    let dataPoints: any[] = [];
    let workSum = 0;
    let valueSum = 0;
    let previousLineEnd: any = {
      workSum: 0,
      valueSum: 0,
    };
    graphTaskLists.forEach((version) => {
      const { name } = version;
      const tasks = [...version.tasks];

      dataPoints = [
        ...dataPoints,
        Object.assign(previousLineEnd, { [name]: previousLineEnd.valueSum }),
        ...tasks.map((task) => {
          const work =
            calcTaskAverageRating(TaskRatingDimension.RequiredWork, task) || 0;
          const value = calcTaskValueSum(task);
          workSum += work;
          valueSum += value;

          return {
            [name]: valueSum,
            workSum,
            valueSum,
          };
        }),
      ];

      // Resetting sums when the first ("optimal roadmap") chart has been drawn
      if (version.name === DataKeys.OptimalRoadmap) {
        workSum = 0;
        valueSum = 0;
      }
      // Version charts are supposed to be in a series so that next versions chart starts from where the previous ended
      // Save last point of chart so next chart can begin there
      previousLineEnd = {
        workSum,
        valueSum,
      };
    });

    return dataPoints;
  };

  const dataPoints = [...versionDataPoints(), ...(savedData || [])];

  const toggleSavedData = () => {
    if (savedData !== undefined) {
      setSavedData(undefined);
      return;
    }

    const savedDataPts = [...dataPoints]
      .filter(
        (data) =>
          !Object.keys(data).includes(DataKeys.OptimalRoadmap) &&
          !Object.keys(data).includes(DataKeys.SavedData),
      )
      .map((data) => {
        return {
          workSum: data.workSum,
          valueSum: data.valueSum,
          [DataKeys.SavedData]: data.valueSum,
        };
      });
    setSavedData(savedDataPts);
  };

  // Calculating X and Y axis min and max values and tick count
  const workSumMax = dataPoints.reduce((prevMax, dataPt) => {
    return Math.max(prevMax, dataPt.workSum);
  }, 0);
  const valueSumMax = dataPoints.reduce(
    (prevMax, dataPt) => Math.max(prevMax, dataPt.valueSum),
    0,
  );
  const workDomainMax = Math.max(Math.ceil(workSumMax / 5) * 5, 10);
  const valueDomainMax = Math.max(Math.ceil(valueSumMax / 5) * 5, 10);
  const workAxisTicks = workDomainMax / 5 + 1;
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
            tickCount={workAxisTicks}
            type="number"
            dataKey="workSum"
            domain={[0, workDomainMax]}
          >
            <Label position="insideLeft">Work</Label>
          </XAxis>
          <CartesianGrid vertical={false} />

          <YAxis
            type="number"
            tickCount={valueAxisTicks}
            domain={[0, valueDomainMax]}
          >
            <Label position="insideBottom">Value</Label>
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
