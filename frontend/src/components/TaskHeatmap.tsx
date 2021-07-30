import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { RootState } from '../redux/types';
import { ratingsSummaryByDimension } from '../utils/TaskUtils';
import css from './TaskHeatmap.module.scss';

const classes = classNames.bind(css);

const lerp = (a: number, b: number, amount: number) => a + amount * (b - a);

const matrix2d = ({ rows, cols }: { rows: number; cols: number }): number[][] =>
  Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));

export const TaskHeatmap = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const frequencies = matrix2d({ rows: 11, cols: 11 });
  if (currentRoadmap) {
    currentRoadmap.tasks.map(ratingsSummaryByDimension).forEach((ratings) => {
      const value = ratings.get(TaskRatingDimension.BusinessValue);
      const work = ratings.get(TaskRatingDimension.RequiredWork);
      if (value && work) {
        const avgValue = Math.round(value.avg);
        const avgWork = Math.round(work.avg);
        frequencies[10 - avgValue][avgWork] += 1;
      }
    });
  }

  const [minFreq, median, maxFreq] = (() => {
    const nonZero = frequencies
      .flatMap((row) => row.filter((n) => n > 0))
      .sort((a, b) => a - b);
    if (nonZero.length === 0) return [0, 0, 0];
    return [
      nonZero[0],
      nonZero[Math.floor(nonZero.length / 2)],
      nonZero[nonZero.length - 1],
    ];
  })();

  const relativeToMedian = (value: number) => {
    if (value <= median) {
      return 0.5 * ((value - minFreq) / median);
    }
    return 0.5 * (1 + (value - median) / (maxFreq - median));
  };

  const color = (value: number) => {
    if (value === 0) return 'white';
    const p = relativeToMedian(value);
    const h = lerp(60, 0, p).toFixed();
    const s = lerp(95, 85, p).toFixed();
    const l = lerp(50, 60, p).toFixed();
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <div className={classes(css.outerContainer)}>
      <p>Task heatmap</p>
      <div className={classes(css.graphicsFlexbox)}>
        <div className={css.graphicsContainer}>
          {frequencies.map((row, i) => (
            <div className={classes(css.row)} key={i}>
              {row.map((value, ii) => (
                <div
                  className={classes(css.tile)}
                  style={{ backgroundColor: color(value) }}
                  key={ii}
                />
              ))}
            </div>
          ))}
        </div>
        <p className={classes(css.yaxismax)}>10</p>
        <p className={classes(css.yaxismin)}>0</p>
        <p className={classes(css.yaxislabel)}>Value</p>
      </div>
      <p className={classes(css.xaxismin)}>0</p>
      <p className={classes(css.xaxislabel)}>Work</p>
      <p className={classes(css.xaxismax)}>10</p>
    </div>
  );
};
