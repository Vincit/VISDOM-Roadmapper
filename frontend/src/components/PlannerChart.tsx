import { FC, useState } from 'react';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
  ratingSummary,
  hasRatingsOnEachDimension,
} from '../utils/TaskUtils';
import { sort, SortingOrders, sortKeyNumeric } from '../utils/SortUtils';
import css from './PlannerChart.module.scss';
import { apiV2 } from '../api/api';
import color from '../colors.module.scss';

const classes = classNames.bind(css);

const colors = [
  color.random_1,
  color.random_2,
  color.random_3,
  color.random_4,
  color.random_5,
  color.random_6,
  color.random_7,
  color.random_8,
  color.random_9,
  color.random_10,
] as const;

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
          const { value, complexity } = ratingSummary(task);
          complexitySum += complexity();
          valueSum += value().total;

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
      <div className={classes(css.title)}>Project roadmap</div>
      <ResponsiveContainer width="100%" aspect={1.1}>
        <LineChart
          data={dataPoints}
          margin={{ top: 16, right: 16, left: 0, bottom: 32 }}
        >
          <CartesianGrid vertical={false} />
          {savedData ? (
            <Line
              isAnimationActive={false}
              key={DataKeys.SavedData}
              id={DataKeys.SavedData}
              name={DataKeys.SavedData}
              type="linear"
              dataKey={DataKeys.SavedData}
              stroke="black"
              strokeWidth={2}
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
              strokeWidth={2}
            />
          )}
          {versionKeyNames.reverse().map((vername, index) => (
            <Line
              isAnimationActive={false}
              id={vername}
              key={vername}
              name={vername}
              type="linear"
              dataKey={vername}
              stroke={
                colors[(versionKeyNames.length - 1 - index) % colors.length]
              }
              strokeWidth={2}
            />
          ))}

          <YAxis
            type="number"
            tickCount={valueAxisTicks}
            domain={[0, valueDomainMax]}
          >
            <Label
              position="center"
              angle={-90}
              dx={-20}
              dy={-14}
              className={classes(css.label)}
            >
              Total Value
            </Label>
          </YAxis>
          <XAxis
            tickCount={complexityAxisTicks}
            type="number"
            dataKey="complexitySum"
            domain={[0, complexityDomainMax]}
          >
            <Label
              position="center"
              dx={-4}
              dy={20}
              className={classes(css.label)}
            >
              Total Complexity
            </Label>
          </XAxis>
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ bottom: 12 }}
            // eslint-disable-next-line react/no-unstable-nested-components
            content={({ payload }) =>
              payload ? (
                <div className={classes(css.legendColumn)}>
                  <div className={classes(css.legendWrapper)}>
                    <Legend payload={payload.slice(0, 1)} />
                  </div>
                  <div className={classes(css.legendWrapper)}>
                    <Legend payload={payload.slice(1).reverse()} />
                  </div>
                </div>
              ) : null
            }
            className={classes(css.legend)}
          />
        </LineChart>
      </ResponsiveContainer>
      {!hideButtons && (
        <div className={classes(css.buttonsBar)}>
          <button
            className={classes(css['button-large'])}
            type="submit"
            onClick={toggleSavedData}
          >
            {savedData ? <LockOutlinedIcon /> : <LockOpenOutlinedIcon />}
            Compare these versions
          </button>
        </div>
      )}
    </div>
  );
};
